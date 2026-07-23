/**
 * Fetches real podcast cover art from the public iTunes Search API and writes
 * a slug -> { artworkUrl, appleUrl } map to data/seed/artwork.json. The app and
 * the DB import read that map, so real art replaces the generated monograms
 * everywhere the moment this file is populated.
 *
 * Run it from any machine with open outbound network (your laptop, or a session
 * whose network policy allows itunes.apple.com):
 *
 *     node scripts/fetch-artwork.mjs
 *
 * In a restricted Claude session the proxy must allow Apple; then run:
 *     NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt node scripts/fetch-artwork.mjs
 *
 * Idempotent: keeps existing entries, only fills shows still missing art.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "csv-parse/sync";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const CSV = join(root, "data/seed/podcasts_seed.csv");
const OUT = join(root, "data/seed/artwork.json");

const norm = (s) =>
  s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\b(the|podcast|show|with.*)\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function upgrade(url) {
  // Apple returns 100x100/600x600 variants; prefer a crisp 600.
  return url ? url.replace(/\/\d+x\d+bb?\.(jpg|png)/, "/600x600bb.$1") : url;
}

function bestMatch(target, results) {
  const t = norm(target);
  let best = null;
  let bestScore = 0;
  for (const r of results) {
    const c = norm(r.collectionName || "");
    let score = 0;
    if (c === t) score = 4;
    else if (c.startsWith(t) || t.startsWith(c)) score = 3;
    else if (c.includes(t) || t.includes(c)) score = 2;
    else {
      const tw = new Set(t.split(" "));
      const overlap = c.split(" ").filter((w) => tw.has(w)).length;
      score = overlap >= 2 ? 1 : 0;
    }
    if (score > bestScore) {
      bestScore = score;
      best = r;
    }
  }
  return bestScore > 0 ? best : null;
}

async function search(term) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(
    term,
  )}&entity=podcast&limit=5`;
  const res = await fetch(url, { headers: { "User-Agent": "RunThePlay/0.1" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return json.results ?? [];
}

async function main() {
  const rows = parse(readFileSync(CSV, "utf8"), {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }).filter((r) => r.podcast_name);

  const map = JSON.parse(readFileSync(OUT, "utf8"));
  let filled = 0;
  let missed = 0;

  for (const r of rows) {
    const slug = r.slug || norm(r.podcast_name).replace(/\s+/g, "-");
    if (map[slug]?.artworkUrl) continue; // already have it

    try {
      const results = await search(r.podcast_name);
      const m = bestMatch(r.podcast_name, results);
      if (m && m.artworkUrl600) {
        map[slug] = {
          artworkUrl: upgrade(m.artworkUrl600 || m.artworkUrl100),
          appleUrl: m.collectionViewUrl || "",
        };
        filled++;
        console.log(`  ✓ ${r.podcast_name} -> ${map[slug].artworkUrl}`);
      } else {
        missed++;
        console.log(`  · ${r.podcast_name} — no Apple match (keeps generated art)`);
      }
    } catch (err) {
      missed++;
      console.log(`  ✗ ${r.podcast_name}: ${err.message}`);
    }
    await sleep(400); // be polite to the API
  }

  writeFileSync(OUT, JSON.stringify(map, null, 1) + "\n");
  console.log(`\nDone. Filled ${filled}, no match ${missed}. Wrote ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
