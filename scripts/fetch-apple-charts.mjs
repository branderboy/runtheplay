/**
 * Apple Podcasts charts. Keyless and free: Apple publishes its top-podcasts
 * charts as public JSON feeds. We check the overall US top chart plus the
 * genre charts our roster lives in, match by strict normalized title, and
 * record the best rank per show:
 *   data/seed/apple_charts.json = { slug: { rank, chart, fetchedAt } }
 *
 * Profiles show it as a sourced, dated trust chip ("#N Apple Podcasts,
 * Comedy"). No key needed, so this runs on every weekly refresh.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "csv-parse/sync";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const CSV = join(root, "data/seed/podcasts_seed.csv");
const OUT = join(root, "data/seed/apple_charts.json");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const norm = (s) =>
  s.toLowerCase().replace(/&/g, " and ").replace(/\b(the|a|podcast|show|with.*)\b/g, "")
    .replace(/[^a-z0-9]+/g, " ").trim();

/** Chart sources: the modern marketing-tools feed + legacy genre feeds. */
const CHARTS = [
  {
    name: "Top Podcasts (US)",
    url: "https://rss.applemarketingtools.com/api/v2/us/podcasts/top/200/podcasts.json",
    kind: "v2",
  },
  { name: "Comedy (US)", genre: 1303 },
  { name: "Sports (US)", genre: 1545 },
  { name: "Music (US)", genre: 1310 },
  { name: "Business (US)", genre: 1321 },
  { name: "Society & Culture (US)", genre: 1324 },
].map((c) =>
  c.genre
    ? {
        ...c,
        kind: "legacy",
        url: `https://itunes.apple.com/us/rss/toppodcasts/limit=200/genre=${c.genre}/json`,
      }
    : c,
);

async function fetchChart(c) {
  const res = await fetch(c.url, { headers: { "User-Agent": "RunThePlay/1.0" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const j = await res.json();
  if (c.kind === "v2") {
    return (j.feed?.results ?? []).map((e, i) => ({ title: e.name ?? "", rank: i + 1 }));
  }
  return (j.feed?.entry ?? []).map((e, i) => ({
    title: e["im:name"]?.label ?? "",
    rank: i + 1,
  }));
}

async function main() {
  const rows = parse(readFileSync(CSV, "utf8"), {
    columns: true, skip_empty_lines: true, trim: true,
  }).filter((r) => r.podcast_name);
  const shows = rows.map((r) => ({ slug: r.slug, name: r.podcast_name, t: norm(r.podcast_name) }));

  const map = {};
  const today = new Date().toISOString().slice(0, 10);

  for (const c of CHARTS) {
    try {
      const entries = await fetchChart(c);
      let hits = 0;
      for (const e of entries) {
        const et = norm(e.title);
        if (!et) continue;
        const show = shows.find((s) => s.t && (s.t === et || et.includes(s.t) || s.t.includes(et)));
        if (!show) continue;
        const prev = map[show.slug];
        if (!prev || e.rank < prev.rank) {
          map[show.slug] = { rank: e.rank, chart: c.name, fetchedAt: today };
          hits++;
        }
      }
      console.log(`  ✓ ${c.name}: ${entries.length} entries, ${hits} roster hits`);
    } catch (err) {
      console.log(`  ✗ ${c.name}: ${err.message}`);
    }
    await sleep(400);
  }

  writeFileSync(OUT, JSON.stringify(map, null, 1) + "\n");
  console.log(`\nDone. ${Object.keys(map).length} shows charted. Wrote ${OUT}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
