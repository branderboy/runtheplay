/**
 * Fetches real podcast cover art and writes a slug -> { artworkUrl, sourceUrl,
 * provider } map to data/seed/artwork.json. The app and DB import read that map,
 * so real art replaces the generated monograms everywhere the moment it's
 * populated — no other code changes needed.
 *
 * Source order: Spotify (clean square cover art) → iTunes (no key) as fallback.
 *
 * Spotify needs a free app's credentials (https://developer.spotify.com/dashboard):
 *     SPOTIFY_CLIENT_ID=xxx SPOTIFY_CLIENT_SECRET=yyy node scripts/fetch-artwork.mjs
 * Without them it uses iTunes only. iTunes needs nothing.
 *
 * Run from any machine with open outbound network. (This Claude environment's
 * network policy blocks Apple AND Spotify hosts, so it must run elsewhere, or
 * after the environment's network policy is opened.)
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

/** Pick the best candidate by title similarity; return null if nothing matches. */
function bestMatch(target, candidates) {
  const t = norm(target);
  let best = null;
  let score = 0;
  for (const c of candidates) {
    const n = norm(c.title || "");
    let s = 0;
    if (n === t) s = 4;
    else if (n.startsWith(t) || t.startsWith(n)) s = 3;
    else if (n.includes(t) || t.includes(n)) s = 2;
    else {
      const tw = new Set(t.split(" "));
      s = n.split(" ").filter((w) => tw.has(w)).length >= 2 ? 1 : 0;
    }
    if (s > score) {
      score = s;
      best = c;
    }
  }
  return score > 0 ? best : null;
}

/* --------------------------------- Spotify -------------------------------- */

async function spotifyToken() {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) return null;
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`Spotify token HTTP ${res.status}`);
  return (await res.json()).access_token;
}

async function spotifySearch(token, term) {
  const url = `https://api.spotify.com/v1/search?type=show&market=US&limit=5&q=${encodeURIComponent(term)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Spotify search HTTP ${res.status}`);
  const items = (await res.json()).shows?.items ?? [];
  return items.map((s) => ({
    title: s.name,
    imageUrl: (s.images ?? []).sort((a, b) => (b.width ?? 0) - (a.width ?? 0))[0]?.url,
    sourceUrl: s.external_urls?.spotify ?? "",
  }));
}

/* --------------------------------- iTunes --------------------------------- */

async function itunesSearch(term) {
  const url = `https://itunes.apple.com/search?entity=podcast&limit=5&term=${encodeURIComponent(term)}`;
  const res = await fetch(url, { headers: { "User-Agent": "RunThePlay/0.1" } });
  if (!res.ok) throw new Error(`iTunes HTTP ${res.status}`);
  const results = (await res.json()).results ?? [];
  return results.map((r) => ({
    title: r.collectionName,
    imageUrl: (r.artworkUrl600 || r.artworkUrl100 || "").replace(
      /\/\d+x\d+bb?\.(jpg|png)/,
      "/600x600bb.$1",
    ),
    sourceUrl: r.collectionViewUrl ?? "",
  }));
}

/* ---------------------------------- main ---------------------------------- */

async function main() {
  const rows = parse(readFileSync(CSV, "utf8"), {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }).filter((r) => r.podcast_name);

  const map = JSON.parse(readFileSync(OUT, "utf8"));

  let token = null;
  try {
    token = await spotifyToken();
  } catch (e) {
    console.log(`Spotify auth failed (${e.message}); using iTunes only.`);
  }
  console.log(token ? "Source: Spotify → iTunes fallback\n" : "Source: iTunes\n");

  let filled = 0;
  let missed = 0;
  for (const r of rows) {
    const slug = r.slug || norm(r.podcast_name).replace(/\s+/g, "-");
    if (map[slug]?.artworkUrl) continue;

    let hit = null;
    let provider = null;
    try {
      if (token) {
        hit = bestMatch(r.podcast_name, await spotifySearch(token, r.podcast_name));
        if (hit?.imageUrl) provider = "spotify";
      }
      if (!hit?.imageUrl) {
        hit = bestMatch(r.podcast_name, await itunesSearch(r.podcast_name));
        if (hit?.imageUrl) provider = "itunes";
      }
    } catch (e) {
      console.log(`  ✗ ${r.podcast_name}: ${e.message}`);
    }

    if (hit?.imageUrl) {
      map[slug] = { artworkUrl: hit.imageUrl, sourceUrl: hit.sourceUrl, provider };
      filled++;
      console.log(`  ✓ ${r.podcast_name} [${provider}]`);
    } else {
      missed++;
      console.log(`  · ${r.podcast_name} — no match (keeps generated art)`);
    }
    await sleep(350);
  }

  writeFileSync(OUT, JSON.stringify(map, null, 1) + "\n");
  console.log(`\nDone. Filled ${filled}, no match ${missed}. Wrote ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
