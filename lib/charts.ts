import { getAllPodcasts, type Podcast } from "@/lib/data/podcasts";

/**
 * The data engine. Charts are computed deterministically from stored podcast
 * data and every value carries its trust label (Public vs Estimated), so a
 * chart graphic can never claim more than the data supports.
 *
 * Launch charts rank by REACH (level charts) because that's what current public
 * data supports. Growth and engagement charts (views-per-subscriber, fastest
 * rising) unlock once weekly snapshots accumulate — see scripts/snapshot.mjs.
 */

export const CAPTURE_DATE = "2026-07-23";
export const CHART_WEEK = "Week of July 23, 2026";

export interface ChartEntry {
  rank: number;
  slug: string;
  name: string;
  artworkUrl: string | null;
  primaryCategory: string | null;
  value: number;
  display: string;
  source: "Public" | "Estimated";
}

export interface ChartDef {
  slug: string;
  title: string;
  subtitle: string;
  metricLabel: string;
  methodology: string;
}

export const CHARTS: ChartDef[] = [
  {
    slug: "youtube-subscribers",
    title: "Top YouTube Subscribers",
    subtitle: "The biggest Black-creator channels by public subscriber count.",
    metricLabel: "Subscribers",
    methodology:
      "Ranked by public YouTube subscriber count. Figures marked Estimated come from compiled public lists and are directional until a creator connects their channel.",
  },
  {
    slug: "instagram-followers",
    title: "Top Instagram Followers",
    subtitle: "Where the culture's shows carry the most social weight.",
    metricLabel: "Followers",
    methodology:
      "Ranked by public Instagram follower count captured as a dated snapshot.",
  },
  {
    slug: "combined-reach",
    title: "Biggest Combined Reach",
    subtitle: "Total followers across every public platform on file.",
    metricLabel: "Total reach",
    methodology:
      "Sum of public follower/subscriber counts across YouTube, Instagram, TikTok, and X. Estimated if any component is estimated.",
  },
  {
    slug: "cross-platform",
    title: "Most Cross-Platform",
    subtitle: "Shows built to work everywhere: feed and clip economy.",
    metricLabel: "Platforms",
    methodology:
      "Ranked by number of public platforms on file, then by combined reach. Reflects a show's clip-economy footprint, not audience size.",
  },
  {
    slug: "viral-clips",
    title: "Most Viral Clips",
    subtitle: "Each show's biggest upload of the last 30 days.",
    metricLabel: "Clip views",
    methodology:
      "Ranked by the view count of each show's most-viewed YouTube upload published in the last 30 days, via the official YouTube Data API. Refreshed weekly.",
  },
];

function fmt(n: number): string {
  if (n >= 1e6) return `${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1)}M`;
  if (n >= 1e3) return `${Math.round(n / 1e3)}K`;
  return String(n);
}

function followers(p: Podcast, platform: string): number {
  return p.platforms.find((x) => x.platform === platform)?.followers ?? 0;
}

function combined(p: Podcast): number {
  return p.platforms.reduce((n, x) => n + (x.followers ?? 0), 0);
}

function sourceOf(p: Podcast): "Public" | "Estimated" {
  return p.dataConfidence === "inferred" || p.dataConfidence === "estimated"
    ? "Estimated"
    : "Public";
}

function rank(
  rows: { p: Podcast; value: number }[],
  display: (v: number) => string,
  limit = 15,
): ChartEntry[] {
  return rows
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value || a.p.name.localeCompare(b.p.name))
    .slice(0, limit)
    .map((r, i) => ({
      rank: i + 1,
      slug: r.p.slug,
      name: r.p.name,
      artworkUrl: r.p.artworkUrl,
      primaryCategory: r.p.primaryCategory,
      value: r.value,
      display: display(r.value),
      source: sourceOf(r.p),
    }));
}

export function computeChart(slug: string): ChartEntry[] {
  const pods = getAllPodcasts().filter((p) => p.status !== "inactive");
  switch (slug) {
    case "youtube-subscribers":
      return rank(pods.map((p) => ({ p, value: followers(p, "youtube") })), fmt);
    case "instagram-followers":
      return rank(pods.map((p) => ({ p, value: followers(p, "instagram") })), fmt);
    case "combined-reach":
      return rank(pods.map((p) => ({ p, value: combined(p) })), fmt);
    case "cross-platform":
      return rank(
        pods.map((p) => ({
          p,
          // platforms with a real follower count, tie-broken by reach below
          value: p.platforms.filter((x) => (x.followers ?? 0) > 0).length * 1e9 + combined(p),
        })),
        (v) => `${Math.floor(v / 1e9)} platforms`,
        15,
      );
    case "viral-clips":
      return rank(pods.map((p) => ({ p, value: p.topClip?.views ?? 0 })), fmt);
    default:
      return [];
  }
}

export function getChart(slug: string): ChartDef | undefined {
  return CHARTS.find((c) => c.slug === slug);
}
