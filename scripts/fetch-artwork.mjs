/**
 * Pulls real cover art from SPOTIFY and writes a slug -> { artworkUrl, sourceUrl,
 * provider } map to data/seed/artwork.json. The app and DB import read that map,
 * so real art replaces the generated monograms everywhere it's populated.
 *
 * Primary path — Spotify oEmbed (NO credentials needed): for every show with a
 * known Spotify URL in data/seed/spotify_urls.json, GET
 *   https://open.spotify.com/oembed?url=<showUrl>
 * and use the returned thumbnail_url (Spotify's square cover art).
 *
 * Fallback — Spotify Web API search (if the show URL is missing and
 * SPOTIFY_CLIENT_ID/SECRET are set).
 *
 * Run from any machine with open outbound network:
 *     node scripts/fetch-artwork.mjs
 * (This Claude environment's network policy blocks Spotify hosts, so it must run
 * elsewhere, or after the environment's network policy is opened.)
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
const URLS = join(root, "data/seed/spotify_urls.json");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const norm = (s) =>
  s.toLowerCase().replace(/&/g, " and ").replace(/\b(the|podcast|show|with.*)\b/g, "")
    .replace(/[^a-z0-9]+/g, " ").trim();

/** Keyless: Spotify oEmbed for a known show URL → square thumbnail. */
async function oembed(showUrl) {
  const res = await fetch(
    `https://open.spotify.com/oembed?url=${encodeURIComponent(showUrl)}`,
  );
  if (!res.ok) throw new Error(`oEmbed HTTP ${res.status}`);
  const j = await res.json();
  return j.thumbnail_url || null;
}

/** Optional fallback: Spotify Web API search by name (needs app credentials). */
async function apiToken() {
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
  if (!res.ok) throw new Error(`token HTTP ${res.status}`);
  return (await res.json()).access_token;
}

async function apiSearch(token, name) {
  const res = await fetch(
    `https://api.spotify.com/v1/search?type=show&market=US&limit=5&q=${encodeURIComponent(name)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) throw new Error(`search HTTP ${res.status}`);
  const items = (await res.json()).shows?.items ?? [];
  const t = norm(name);
  const best = items.find((s) => {
    const n = norm(s.name);
    return n === t || n.includes(t) || t.includes(n);
  }) || items[0];
  if (!best) return null;
  const img = (best.images ?? []).sort((a, b) => (b.width ?? 0) - (a.width ?? 0))[0]?.url;
  return img ? { artworkUrl: img, sourceUrl: best.external_urls?.spotify ?? "" } : null;
}

async function main() {
  const rows = parse(readFileSync(CSV, "utf8"), {
    columns: true, skip_empty_lines: true, trim: true,
  }).filter((r) => r.podcast_name);
  const map = JSON.parse(readFileSync(OUT, "utf8"));
  const urls = JSON.parse(readFileSync(URLS, "utf8"));

  let token = null;
  try { token = await apiToken(); } catch (e) { console.log(`Spotify API auth off (${e.message}); oEmbed only.`); }

  let filled = 0, missed = 0;
  for (const r of rows) {
    const slug = r.slug;
    if (map[slug]?.artworkUrl) continue;

    let art = null, sourceUrl = urls[slug] || "";
    try {
      if (urls[slug]) {
        art = await oembed(urls[slug]);
      }
      if (!art && token) {
        const hit = await apiSearch(token, r.podcast_name);
        if (hit) { art = hit.artworkUrl; sourceUrl = hit.sourceUrl; }
      }
    } catch (e) {
      console.log(`  ✗ ${r.podcast_name}: ${e.message}`);
    }

    if (art) {
      map[slug] = { artworkUrl: art, sourceUrl, provider: "spotify" };
      filled++;
      console.log(`  ✓ ${r.podcast_name}`);
    } else {
      missed++;
      console.log(`  · ${r.podcast_name} — no Spotify art (keeps generated)`);
    }
    await sleep(300);
  }

  writeFileSync(OUT, JSON.stringify(map, null, 1) + "\n");
  console.log(`\nDone. Filled ${filled}, no match ${missed}. Wrote ${OUT}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
