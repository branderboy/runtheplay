/**
 * TikTok + Instagram public data via Apify (paid, usage-based). Two actors:
 *   clockworks~tiktok-scraper   — profile followers + recent video play counts
 *   apify~instagram-scraper     — profile followers + latest posts with views
 *
 * Writes two overlays:
 *   data/seed/social_stats.json { slug: { tiktok?: {followers, fetchedAt}, instagram?: {...} } }
 *   data/seed/social_clips.json { slug: { clips: [{platform,title,views,publishedAt,url}], fetchedAt } }
 *
 * Scraped public counts are third-party data; the UI labels clip sources per
 * platform and never presents them as verified. Needs APIFY_TOKEN (apify.com,
 * usage-based: roughly $1.70/1k TikTok results, $1.50/1k Instagram items, so a
 * weekly 66-show run costs a few dollars). Skips cleanly when unset.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "csv-parse/sync";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const CSV = join(root, "data/seed/podcasts_seed.csv");
const OUT_STATS = join(root, "data/seed/social_stats.json");
const OUT_CLIPS = join(root, "data/seed/social_clips.json");

const TOKEN = process.env.APIFY_TOKEN;
if (!TOKEN) {
  console.log("APIFY_TOKEN not set. Skipping (nothing changed).");
  process.exit(0);
}

const API = "https://api.apify.com/v2";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const DAYS_30 = 30 * 24 * 3600 * 1000;

/** Start an actor run, poll to completion (<= 10 min), return dataset items. */
async function runActor(actorId, input) {
  const start = await fetch(`${API}/acts/${actorId}/runs?token=${TOKEN}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!start.ok) throw new Error(`start HTTP ${start.status}`);
  const run = (await start.json()).data;

  const deadline = Date.now() + 10 * 60 * 1000;
  let status = run.status;
  while (!["SUCCEEDED", "FAILED", "ABORTED", "TIMED-OUT"].includes(status)) {
    if (Date.now() > deadline) throw new Error("poll timeout");
    await sleep(10_000);
    const res = await fetch(`${API}/actor-runs/${run.id}?token=${TOKEN}`);
    status = (await res.json()).data?.status ?? "FAILED";
  }
  if (status !== "SUCCEEDED") throw new Error(`run ${status}`);

  const items = await fetch(
    `${API}/datasets/${run.defaultDatasetId}/items?token=${TOKEN}&clean=true`,
  );
  if (!items.ok) throw new Error(`dataset HTTP ${items.status}`);
  return items.json();
}

const chunk = (arr, n) =>
  Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));

async function main() {
  const rows = parse(readFileSync(CSV, "utf8"), {
    columns: true, skip_empty_lines: true, trim: true,
  }).filter((r) => r.podcast_name);

  const tiktok = []; // { slug, username }
  const instagram = []; // { slug, url, username }
  for (const r of rows) {
    const tt = /tiktok\.com\/@([\w.-]+)/.exec(r.tiktok_url ?? "");
    if (tt) tiktok.push({ slug: r.slug, username: tt[1].toLowerCase() });
    const ig = /instagram\.com\/([\w.-]+)/.exec(r.instagram_url ?? "");
    if (ig && !["p", "reel", "explore"].includes(ig[1]))
      instagram.push({
        slug: r.slug,
        username: ig[1].toLowerCase(),
        url: `https://www.instagram.com/${ig[1]}/`,
      });
  }
  console.log(`Profiles on file: ${tiktok.length} TikTok, ${instagram.length} Instagram`);

  const stats = existsSync(OUT_STATS) ? JSON.parse(readFileSync(OUT_STATS, "utf8")) : {};
  const clipsMap = existsSync(OUT_CLIPS) ? JSON.parse(readFileSync(OUT_CLIPS, "utf8")) : {};
  const today = new Date().toISOString().slice(0, 10);
  const cutoff = Date.now() - DAYS_30;
  const addClip = (slug, clip) => {
    const cur = clipsMap[slug]?.fetchedAt === today ? clipsMap[slug].clips : [];
    clipsMap[slug] = {
      clips: [...cur, clip].sort((a, b) => b.views - a.views).slice(0, 5),
      fetchedAt: today,
    };
  };

  /* ------------------------------- TikTok -------------------------------- */
  for (const group of chunk(tiktok, 15)) {
    try {
      const items = await runActor("clockworks~tiktok-scraper", {
        profiles: group.map((g) => g.username),
        resultsPerPage: 10,
        shouldDownloadVideos: false,
        shouldDownloadCovers: false,
        shouldDownloadSubtitles: false,
      });
      for (const it of items) {
        const uname = (it.authorMeta?.name ?? "").toLowerCase();
        const hit = group.find((g) => g.username === uname);
        if (!hit) continue;
        const fans = Number(it.authorMeta?.fans ?? 0);
        if (fans > 0)
          stats[hit.slug] = {
            ...stats[hit.slug],
            tiktok: { followers: fans, fetchedAt: today },
          };
        const views = Number(it.playCount ?? 0);
        const published = (it.createTimeISO ?? "").slice(0, 10);
        if (views > 0 && published && new Date(published).getTime() >= cutoff)
          addClip(hit.slug, {
            platform: "tiktok",
            title: (it.text ?? "").slice(0, 120),
            views,
            publishedAt: published,
            url: it.webVideoUrl ?? null,
          });
      }
      console.log(`  ✓ TikTok batch of ${group.length}`);
    } catch (e) {
      console.log(`  ✗ TikTok batch: ${e.message}`);
    }
  }

  /* ------------------------------ Instagram ------------------------------ */
  for (const group of chunk(instagram, 15)) {
    try {
      const items = await runActor("apify~instagram-scraper", {
        directUrls: group.map((g) => g.url),
        resultsType: "details",
        resultsLimit: 1,
      });
      for (const it of items) {
        const uname = (it.username ?? "").toLowerCase();
        const hit = group.find((g) => g.username === uname);
        if (!hit) continue;
        const followers = Number(it.followersCount ?? 0);
        if (followers > 0)
          stats[hit.slug] = {
            ...stats[hit.slug],
            instagram: { followers, fetchedAt: today },
          };
        for (const post of it.latestPosts ?? []) {
          const views = Number(post.videoViewCount ?? 0);
          const published = (post.timestamp ?? "").slice(0, 10);
          if (views > 0 && published && new Date(published).getTime() >= cutoff)
            addClip(hit.slug, {
              platform: "instagram",
              title: (post.caption ?? "").slice(0, 120),
              views,
              publishedAt: published,
              url: post.url ?? null,
            });
        }
      }
      console.log(`  ✓ Instagram batch of ${group.length}`);
    } catch (e) {
      console.log(`  ✗ Instagram batch: ${e.message}`);
    }
  }

  writeFileSync(OUT_STATS, JSON.stringify(stats, null, 1) + "\n");
  writeFileSync(OUT_CLIPS, JSON.stringify(clipsMap, null, 1) + "\n");
  console.log(
    `\nDone. Stats for ${Object.keys(stats).length} shows, clips for ${Object.keys(clipsMap).length}.`,
  );
}

main().catch((e) => { console.error(e); process.exit(1); });
