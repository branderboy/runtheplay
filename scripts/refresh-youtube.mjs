/**
 * Weekly YouTube refresh via the official (free) YouTube Data API v3.
 * 66 channels costs a handful of quota units against the 10,000/day free tier.
 *
 * Writes two overlays:
 *   data/seed/youtube_stats.json  { slug: { channelId, subscribers, fetchedAt } }
 *   data/seed/youtube_clips.json  { slug: { clips: [{videoId,title,views,publishedAt}], fetchedAt } }
 *
 * Stats power the weekly charts. Clips = each channel's most-viewed uploads
 * from the last 30 days (the viral-clip economy, measured officially).
 *
 * Needs YOUTUBE_API_KEY (free at console.cloud.google.com, YouTube Data API v3).
 * Skips cleanly when unset.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "csv-parse/sync";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const CSV = join(root, "data/seed/podcasts_seed.csv");
const OUT = join(root, "data/seed/youtube_stats.json");
const OUT_CLIPS = join(root, "data/seed/youtube_clips.json");

const KEY = process.env.YOUTUBE_API_KEY;
if (!KEY) {
  console.log("YOUTUBE_API_KEY not set. Skipping (nothing changed).");
  process.exit(0);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const API = "https://www.googleapis.com/youtube/v3";

async function get(path) {
  const res = await fetch(`${API}${path}&key=${KEY}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/** Resolve a channel id from the URL forms in the seed: /channel/UC…, /@handle, /c/name, /user/name. */
async function resolveChannel(url) {
  const uc = /\/channel\/(UC[\w-]{20,})/.exec(url);
  if (uc) return uc[1];
  const handle = /youtube\.com\/@([\w.-]+)/.exec(url);
  if (handle) {
    const j = await get(`/channels?part=id&forHandle=${encodeURIComponent(handle[1])}`);
    return j.items?.[0]?.id ?? null;
  }
  const legacy = /youtube\.com\/(?:c|user)\/([\w.-]+)/.exec(url);
  if (legacy) {
    // Legacy custom URLs need a search lookup (100 units, still cheap at this scale).
    const j = await get(`/search?part=snippet&type=channel&maxResults=1&q=${encodeURIComponent(legacy[1])}`);
    return j.items?.[0]?.snippet?.channelId ?? null;
  }
  return null;
}

/** Top recent uploads by views: uploads playlist -> last 50 -> stats -> top 3 of last 30 days. */
async function topRecentClips(uploadsPlaylistId) {
  const items = await get(
    `/playlistItems?part=contentDetails&maxResults=50&playlistId=${uploadsPlaylistId}`,
  );
  const ids = (items.items ?? [])
    .map((i) => i.contentDetails?.videoId)
    .filter(Boolean);
  if (ids.length === 0) return [];
  const vids = await get(`/videos?part=statistics,snippet&id=${ids.join(",")}`);
  const cutoff = Date.now() - 30 * 24 * 3600 * 1000;
  return (vids.items ?? [])
    .map((v) => ({
      videoId: v.id,
      title: v.snippet?.title ?? "",
      views: Number(v.statistics?.viewCount ?? 0),
      publishedAt: (v.snippet?.publishedAt ?? "").slice(0, 10),
    }))
    .filter((v) => v.views > 0 && new Date(v.publishedAt).getTime() >= cutoff)
    .sort((a, b) => b.views - a.views)
    .slice(0, 3);
}

async function main() {
  const rows = parse(readFileSync(CSV, "utf8"), {
    columns: true, skip_empty_lines: true, trim: true,
  }).filter((r) => r.podcast_name);
  const map = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {};
  const clipsMap = existsSync(OUT_CLIPS) ? JSON.parse(readFileSync(OUT_CLIPS, "utf8")) : {};
  const today = new Date().toISOString().slice(0, 10);

  let updated = 0, failed = 0, clipsFound = 0;
  for (const r of rows) {
    const url = (r.youtube_url ?? "").trim();
    if (!url || url === "NEEDS_VERIFICATION") continue;
    try {
      const channelId = map[r.slug]?.channelId ?? (await resolveChannel(url));
      if (!channelId) { failed++; continue; }
      const j = await get(`/channels?part=statistics,contentDetails&id=${channelId}`);
      const item = j.items?.[0];
      const stats = item?.statistics;
      const subs = stats && !stats.hiddenSubscriberCount ? Number(stats.subscriberCount) : null;
      if (subs) {
        map[r.slug] = { channelId, subscribers: subs, fetchedAt: today };
        updated++;
        console.log(`  ✓ ${r.podcast_name}: ${subs.toLocaleString()}`);
      }
      const uploads = item?.contentDetails?.relatedPlaylists?.uploads;
      if (uploads) {
        const clips = await topRecentClips(uploads);
        if (clips.length > 0) {
          clipsMap[r.slug] = { clips, fetchedAt: today };
          clipsFound++;
        }
      }
    } catch (e) {
      failed++;
      console.log(`  ✗ ${r.podcast_name}: ${e.message}`);
    }
    await sleep(120);
  }

  writeFileSync(OUT, JSON.stringify(map, null, 1) + "\n");
  writeFileSync(OUT_CLIPS, JSON.stringify(clipsMap, null, 1) + "\n");
  console.log(
    `\nDone. Stats ${updated}, clips for ${clipsFound} shows, failed ${failed}. Wrote ${OUT} + ${OUT_CLIPS}`,
  );
}

main().catch((e) => { console.error(e); process.exit(1); });
