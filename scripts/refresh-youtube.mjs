/**
 * Weekly YouTube stats refresh via the official (free) YouTube Data API v3.
 * 66 channels costs a handful of quota units against the 10,000/day free tier.
 *
 * Writes an overlay to data/seed/youtube_stats.json:
 *   { slug: { channelId, subscribers, fetchedAt } }
 * The app prefers this overlay over the CSV's static counts, so the weekly
 * charts track real movement.
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

async function main() {
  const rows = parse(readFileSync(CSV, "utf8"), {
    columns: true, skip_empty_lines: true, trim: true,
  }).filter((r) => r.podcast_name);
  const map = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {};
  const today = new Date().toISOString().slice(0, 10);

  let updated = 0, failed = 0;
  for (const r of rows) {
    const url = (r.youtube_url ?? "").trim();
    if (!url || url === "NEEDS_VERIFICATION") continue;
    try {
      const channelId = map[r.slug]?.channelId ?? (await resolveChannel(url));
      if (!channelId) { failed++; continue; }
      const j = await get(`/channels?part=statistics&id=${channelId}`);
      const stats = j.items?.[0]?.statistics;
      const subs = stats && !stats.hiddenSubscriberCount ? Number(stats.subscriberCount) : null;
      if (subs) {
        map[r.slug] = { channelId, subscribers: subs, fetchedAt: today };
        updated++;
        console.log(`  ✓ ${r.podcast_name}: ${subs.toLocaleString()}`);
      }
    } catch (e) {
      failed++;
      console.log(`  ✗ ${r.podcast_name}: ${e.message}`);
    }
    await sleep(120);
  }

  writeFileSync(OUT, JSON.stringify(map, null, 1) + "\n");
  console.log(`\nDone. Updated ${updated}, failed ${failed}. Wrote ${OUT}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
