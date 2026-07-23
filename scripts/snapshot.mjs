/**
 * Weekly snapshot job — the history primitive of the data engine.
 * Appends today's public follower/subscriber counts to
 * data/snapshots/<YYYY-MM-DD>.json. Run it weekly (cron / GitHub Action);
 * once two or more snapshots exist, growth charts ("fastest rising",
 * views-per-subscriber trends) can be computed by diffing dated snapshots.
 *
 *     node scripts/snapshot.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "csv-parse/sync";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const CSV = join(root, "data/seed/podcasts_seed.csv");
const DIR = join(root, "data/snapshots");

const num = (v) => {
  const t = (v || "").replace(/,/g, "").trim();
  const m = /(\d+(?:\.\d+)?)\s*([kmb]?)/i.exec(t);
  if (!m) return null;
  let n = parseFloat(m[1]);
  const s = (m[2] || "").toLowerCase();
  if (s === "k") n *= 1e3;
  else if (s === "m") n *= 1e6;
  else if (s === "b") n *= 1e9;
  return Math.round(n);
};

const rows = parse(readFileSync(CSV, "utf8"), {
  columns: true,
  skip_empty_lines: true,
  trim: true,
}).filter((r) => r.podcast_name);

const date = new Date().toISOString().slice(0, 10);
const snapshot = {
  capturedAt: date,
  shows: rows.map((r) => ({
    slug: r.slug,
    youtubeSubscribers: num(r.youtube_subscribers),
    instagramFollowers: num(r.instagram_followers),
    tiktokFollowers: num(r.tiktok_followers),
    averageVideoViews: num(r.average_video_views),
  })),
};

mkdirSync(DIR, { recursive: true });
const out = join(DIR, `${date}.json`);
writeFileSync(out, JSON.stringify(snapshot, null, 1) + "\n");
console.log(`Wrote snapshot for ${snapshot.shows.length} shows -> ${out}`);
console.log("Run weekly; growth charts unlock once 2+ snapshots exist.");
