/**
 * The Play Sheet: weekly Substack draft, generated from the same real data
 * that powers the site. Runs in the weekly refresh after the data lands and
 * writes content/newsletter/YYYY-MM-DD.md, ready to paste into Substack.
 *
 * Voice: smart, funny, stop-scrolling. The shock comes from REAL numbers,
 * never invented ones. House rules hold: no em-dashes, no emojis, Title Case
 * headings, every stat sourced.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "csv-parse/sync";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => JSON.parse(readFileSync(join(root, p), "utf8"));

const rows = parse(readFileSync(join(root, "data/seed/podcasts_seed.csv"), "utf8"), {
  columns: true, skip_empty_lines: true, trim: true,
}).filter((r) => r.podcast_name);
const yt = read("data/seed/youtube_stats.json");
const ytClips = read("data/seed/youtube_clips.json");
const socialClips = read("data/seed/social_clips.json");
const social = read("data/seed/social_stats.json");
const apple = read("data/seed/apple_charts.json");
const pi = read("data/seed/podcastindex.json");
const plays = read("data/plays.json");
const thesis = read("data/thesis.json");
const guestMoments = read("data/guest_moments.json");

const name = Object.fromEntries(rows.map((r) => [r.slug, r.podcast_name]));
const count = (v) => {
  const t = (v ?? "").toString().trim();
  if (!t || t === "NEEDS_VERIFICATION") return 0;
  const m = /(\d+(?:\.\d+)?)\s*([kmb]?)/i.exec(t.replace(/,/g, ""));
  if (!m) return 0;
  let n = parseFloat(m[1]);
  const s = (m[2] || "").toLowerCase();
  if (s === "k") n *= 1e3; else if (s === "m") n *= 1e6; else if (s === "b") n *= 1e9;
  return Math.round(n);
};
const fmt = (n) =>
  n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${Math.round(n / 1e3)}K` : String(n);

/* Combined reach: live overlays first, CSV counts as fallback. */
const reach = rows
  .map((r) => ({
    slug: r.slug,
    name: r.podcast_name,
    total:
      (yt[r.slug]?.subscribers ?? count(r.youtube_subscribers)) +
      (social[r.slug]?.instagram?.followers ?? count(r.instagram_followers)) +
      (social[r.slug]?.tiktok?.followers ?? count(r.tiktok_followers)),
  }))
  .filter((x) => x.total > 0)
  .sort((a, b) => b.total - a.total);

/* Biggest clip of the last 30 days, any platform. */
const clips = [];
for (const [slug, e] of Object.entries(ytClips))
  for (const c of e.clips ?? []) clips.push({ slug, platform: "YouTube", ...c });
for (const [slug, e] of Object.entries(socialClips))
  for (const c of e.clips ?? [])
    clips.push({ slug, ...c, platform: c.platform === "tiktok" ? "TikTok" : "Instagram" });
clips.sort((a, b) => b.views - a.views);
const topClip = clips[0];

/* Apple receipts. */
const appleHits = Object.entries(apple)
  .map(([slug, e]) => ({ slug, ...e }))
  .sort((a, b) => a.rank - b.rank);
const ones = appleHits.filter((h) => h.rank === 1);

/* Recently active count. */
const today = new Date().toISOString().slice(0, 10);
const cutoff = new Date(Date.now() - 45 * 86400 * 1000).toISOString().slice(0, 10);
const activeCount = Object.values(pi).filter(
  (e) => e.newestItemPubdate && e.newestItemPubdate >= cutoff,
).length;

/* Play of the week: rotate deterministically by ISO week. */
const week = Math.floor(Date.now() / (7 * 86400 * 1000));
const play = plays[week % plays.length];

const stat = thesis.whyItWorks[week % thesis.whyItWorks.length];
const fly = guestMoments[week % guestMoments.length];

const top5 = reach.slice(0, 5);
const md = `# The Play Sheet · ${today}

*Black podcast culture, by the numbers. Real data, weekly, from [Run the Play](https://runtheplay.com).*

---

## Fly on the Wall

${fly.open} ${fly.moment}

The receipt: ${fly.receipt}

${fly.lesson} (Source: [${fly.sourceTitle}](${fly.sourceUrl}).)

Here's the part brands sleep on: the guest chair is bookable. A guest appearance is an ad placement, the strongest one in audio. Shows on Run the Play can publish it as inventory, and buyers can request it like any other placement.

${topClip ? `## Stop Scrolling. ${fmt(topClip.views)} People Didn't.

"${topClip.title.replace(/\n/g, " ").slice(0, 100)}"

That's ${name[topClip.slug] ?? topClip.slug}'s biggest clip of the last 30 days: ${fmt(topClip.views)} views on ${topClip.platform}, posted ${topClip.publishedAt}. One clip. Zero media budget. If your brand bought a billboard this month, a podcast just outran it from a couch.

` : ""}## The Scoreboard

The culture's biggest combined audiences this week (YouTube + Instagram + TikTok, public counts):

${top5.map((s, i) => `${i + 1}. **${s.name}** · ${fmt(s.total)}`).join("\n")}

Full charts, updated weekly, receipts attached: [runtheplay.com/charts](https://runtheplay.com/charts)

## Apple Don't Lie

${appleHits.length} shows in our directory are on Apple's charts right now.${ones.length ? ` ${ones.map((h) => `**${name[h.slug] ?? h.slug}** is sitting at #1 in ${h.chart.replace(" (US)", "")}`).join(". ")}. Not "big for a podcast." Number one.` : ""} The mid-tier ones are the story: same charts, same trust, a fraction of the price.

## The Number Brands Keep Missing

**${stat.value}** ${stat.label}. ${stat.detail} (Source: ${stat.source}.)

Meanwhile the money keeps chasing the same top 100 shows. That gap is the whole play.

## Run This Play

This week's ready-made campaign: **${play.title}** (${play.businessType}, $${play.budget.toLocaleString()}).

${play.objective}

Steal it, change the budget, make it yours: [open it in the Ad Planner](https://runtheplay.com/plays/${play.slug})

---

**Got a show?** ${activeCount} podcasts in the directory published an episode in the last 45 days. If yours isn't one of them because it isn't listed, fix that in two minutes, free: [runtheplay.com/creators](https://runtheplay.com/creators)

**Buying ads like it's 2019?** Tell the planner your goal and budget. It recommends the buy: [runtheplay.com/plan](https://runtheplay.com/plan)

*Every number above is public data with a named source. We don't do fake. That's the brand.*
`;

mkdirSync(join(root, "content/newsletter"), { recursive: true });
const out = join(root, `content/newsletter/${today}.md`);
writeFileSync(out, md);
console.log(`Wrote ${out}`);
