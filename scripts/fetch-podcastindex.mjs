/**
 * Podcast Index enrichment. Free forever, open-source, mission-aligned
 * (podcastindex.org exists to protect independent podcasting).
 *
 * For every show in the seed CSV, searches the index by title (strict
 * normalized name match, never a blind first result) and writes an overlay to
 * data/seed/podcastindex.json:
 *   { slug: { feedUrl, episodeCount, newestItemPubdate, categories, artworkUrl, piId } }
 *
 * The app merges this overlay at load: verified RSS feeds, real episode
 * counts, last-episode dates for the "Recently Active" trust signal.
 *
 * Auth (free key at https://api.podcastindex.org):
 *   PODCASTINDEX_KEY, PODCASTINDEX_SECRET
 * Headers per docs: X-Auth-Key, X-Auth-Date, Authorization = sha1(key+secret+date).
 *
 * Runs on the GitHub runner (open internet). Idempotent: refreshes every run,
 * keeps prior values for shows the index can't match.
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "csv-parse/sync";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const CSV = join(root, "data/seed/podcasts_seed.csv");
const OUT = join(root, "data/seed/podcastindex.json");

const KEY = process.env.PODCASTINDEX_KEY;
const SECRET = process.env.PODCASTINDEX_SECRET;
if (!KEY || !SECRET) {
  console.log("PODCASTINDEX_KEY/SECRET not set. Skipping (nothing changed).");
  process.exit(0);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const norm = (s) =>
  s.toLowerCase().replace(/&/g, " and ").replace(/\b(the|a|podcast|show|with.*)\b/g, "")
    .replace(/[^a-z0-9]+/g, " ").trim();

function authHeaders() {
  const date = Math.floor(Date.now() / 1000);
  return {
    "User-Agent": "RunThePlay/1.0",
    "X-Auth-Key": KEY,
    "X-Auth-Date": String(date),
    Authorization: createHash("sha1").update(`${KEY}${SECRET}${date}`).digest("hex"),
  };
}

async function searchByTerm(name) {
  const res = await fetch(
    `https://api.podcastindex.org/api/1.0/search/byterm?max=10&q=${encodeURIComponent(name)}`,
    { headers: authHeaders() },
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const feeds = (await res.json()).feeds ?? [];
  const t = norm(name);
  return (
    feeds.find((f) => {
      const n = norm(f.title ?? "");
      return n && (n === t || n.includes(t) || t.includes(n));
    }) ?? null
  );
}

async function main() {
  const rows = parse(readFileSync(CSV, "utf8"), {
    columns: true, skip_empty_lines: true, trim: true,
  }).filter((r) => r.podcast_name);
  const map = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {};

  let hit = 0, miss = 0;
  for (const r of rows) {
    try {
      const feed = await searchByTerm(r.podcast_name);
      if (feed) {
        map[r.slug] = {
          piId: feed.id,
          feedUrl: feed.url ?? null,
          episodeCount: feed.episodeCount ?? null,
          newestItemPubdate: feed.newestItemPubdate
            ? new Date(feed.newestItemPubdate * 1000).toISOString().slice(0, 10)
            : null,
          categories: feed.categories ? Object.values(feed.categories) : [],
          artworkUrl: feed.artwork || feed.image || null,
          fetchedAt: new Date().toISOString().slice(0, 10),
        };
        hit++;
        console.log(`  ✓ ${r.podcast_name} (${feed.episodeCount ?? "?"} eps)`);
      } else {
        miss++;
        console.log(`  · ${r.podcast_name} — no confident match`);
      }
    } catch (e) {
      console.log(`  ✗ ${r.podcast_name}: ${e.message}`);
    }
    await sleep(250);
  }

  writeFileSync(OUT, JSON.stringify(map, null, 1) + "\n");
  console.log(`\nDone. Matched ${hit}, no match ${miss}. Wrote ${OUT}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
