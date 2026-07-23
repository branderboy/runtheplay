import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "csv-parse/sync";
import type { PodcastInput } from "@/src/lib/planner/types";
import artworkMap from "@/data/seed/artwork.json";
import spotifyUrlMap from "@/data/seed/spotify_urls.json";

const ARTWORK = artworkMap as Record<
  string,
  { artworkUrl?: string; sourceUrl?: string; provider?: string }
>;
const SPOTIFY = spotifyUrlMap as Record<string, string>;

/**
 * File-backed podcast source. Reads data/seed/podcasts_seed.csv so the app runs
 * with real data before a database is provisioned. Swap the body of
 * `loadPodcasts()` for Drizzle queries once DATABASE_URL is set — the rest of
 * the app depends only on the Podcast shape below.
 */

export interface Platform {
  platform: string;
  url: string;
  followers: number | null;
}

export interface Podcast {
  name: string;
  slug: string;
  shortDescription: string | null;
  officialWebsite: string | null;
  artworkUrl: string | null;
  hosts: string[];
  networkName: string | null;
  independentOrNetwork: string | null;
  primaryCategory: string | null;
  secondaryCategories: string[];
  audienceTags: string[];
  country: string | null;
  stateOrRegion: string | null;
  city: string | null;
  publishingFrequency: string | null;
  mostRecentEpisodeDate: string | null;
  status: string;
  advertisingAvailable: boolean | null;
  advertisingContactEmail: string | null;
  advertisingContactUrl: string | null;
  mediaKitUrl: string | null;
  platforms: Platform[];
  dataConfidence: string | null;
  primarySourceUrl: string | null;
  ownershipStatus: "unclaimed" | "pending" | "claimed";
  verificationStatus: "unverified" | "verified" | "disputed";
}

const clean = (v: string | undefined): string | null => {
  if (v == null) return null;
  const t = v.trim();
  if (t === "" || t.toUpperCase() === "NEEDS_VERIFICATION") return null;
  return t;
};

const parseCount = (v: string | undefined): number | null => {
  const t = clean(v);
  if (!t) return null;
  const m = /(\d+(?:\.\d+)?)\s*([kmb]?)/i.exec(t.replace(/,/g, ""));
  if (!m) return null;
  let n = parseFloat(m[1]);
  const s = (m[2] || "").toLowerCase();
  if (s === "k") n *= 1e3;
  else if (s === "m") n *= 1e6;
  else if (s === "b") n *= 1e9;
  return Math.round(n);
};

const splitMulti = (v: string | undefined): string[] =>
  (clean(v) ?? "").split("|").map((s) => s.trim()).filter(Boolean);

const splitHosts = (v: string | undefined): string[] =>
  (clean(v) ?? "")
    .split(/\s*(?:,|\||&|\/| and )\s*/i)
    .map((s) => s.trim())
    .filter((s) => s && s.toUpperCase() !== "NEEDS_VERIFICATION");

function mapStatus(v: string | undefined): string {
  const t = clean(v)?.toLowerCase() ?? "active";
  if (["active", "yes"].includes(t)) return "active";
  if (t.includes("rebrand")) return "rebranded";
  if (t.includes("inactive") || t.includes("hiatus") || t.includes("ended"))
    return "inactive";
  return "active";
}

function rowToPodcast(r: Record<string, string>): Podcast {
  const platforms: Platform[] = [];
  const add = (platform: string, url: string | undefined, followers?: string) => {
    const u = clean(url);
    if (u) platforms.push({ platform, url: u, followers: parseCount(followers) });
  };
  add("youtube", r.youtube_url, r.youtube_subscribers);
  add("instagram", r.instagram_url, r.instagram_followers);
  add("tiktok", r.tiktok_url, r.tiktok_followers);
  add("x", r.x_url);
  add("apple", r.apple_url);
  add("spotify", r.spotify_url);

  const adAvail = clean(r.advertising_available)?.toLowerCase();

  return {
    name: clean(r.podcast_name) ?? "Untitled",
    slug: clean(r.slug) ?? "",
    shortDescription: clean(r.short_description),
    officialWebsite: clean(r.official_website),
    artworkUrl: clean(r.artwork_url),
    hosts: splitHosts(r.host_names),
    networkName: clean(r.network_name),
    independentOrNetwork: clean(r.independent_or_network),
    primaryCategory: clean(r.primary_category),
    secondaryCategories: splitMulti(r.secondary_categories),
    audienceTags: splitMulti(r.audience_tags),
    country: clean(r.country),
    stateOrRegion: clean(r.state_or_region),
    city: clean(r.city),
    publishingFrequency: clean(r.publishing_frequency),
    mostRecentEpisodeDate: clean(r.most_recent_episode_date),
    status: mapStatus(r.active_status),
    advertisingAvailable: adAvail === "yes" ? true : adAvail === "no" ? false : null,
    advertisingContactEmail: clean(r.advertising_contact_email),
    advertisingContactUrl: clean(r.advertising_contact_url),
    mediaKitUrl: clean(r.media_kit_url),
    platforms,
    dataConfidence: clean(r.data_confidence),
    primarySourceUrl: clean(r.primary_source_url),
    ownershipStatus: "unclaimed",
    verificationStatus: "unverified",
  };
}

let cache: Podcast[] | null = null;

function loadPodcasts(): Podcast[] {
  if (cache) return cache;
  const csv = readFileSync(
    join(process.cwd(), "data", "seed", "podcasts_seed.csv"),
    "utf8",
  );
  const rows: Record<string, string>[] = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
  cache = rows.filter((r) => clean(r.podcast_name)).map(rowToPodcast);
  for (const p of cache) {
    // Overlay real cover art when the fetch script has populated it.
    const art = ARTWORK[p.slug]?.artworkUrl;
    if (art) p.artworkUrl = art;
    // Overlay the verified Spotify show link (drives "Listen on Spotify" + oEmbed).
    const spotify = SPOTIFY[p.slug];
    if (spotify) {
      const existing = p.platforms.find((x) => x.platform === "spotify");
      if (existing) existing.url = spotify;
      else p.platforms.push({ platform: "spotify", url: spotify, followers: null });
    }
  }
  return cache;
}

/* ------------------------------- public API ------------------------------- */

export function getAllPodcasts(): Podcast[] {
  return [...loadPodcasts()].sort((a, b) => a.name.localeCompare(b.name));
}

export function getPodcastBySlug(slug: string): Podcast | undefined {
  return loadPodcasts().find((p) => p.slug === slug);
}

export function listCategories(): string[] {
  const set = new Set<string>();
  for (const p of loadPodcasts()) if (p.primaryCategory) set.add(p.primaryCategory);
  return Array.from(set).sort();
}

export function searchPodcasts(query?: string, category?: string): Podcast[] {
  let list = getAllPodcasts();
  if (category) list = list.filter((p) => p.primaryCategory === category);
  if (query) {
    const q = query.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.hosts.some((h) => h.toLowerCase().includes(q)) ||
        p.audienceTags.some((t) => t.toLowerCase().includes(q)) ||
        (p.primaryCategory ?? "").toLowerCase().includes(q),
    );
  }
  return list;
}

/** Adapts a Podcast into the pure matcher input shape. */
export function toPlannerInput(p: Podcast): PodcastInput {
  const filled = [
    p.shortDescription,
    p.officialWebsite,
    p.primaryCategory,
    p.hosts.length ? "hosts" : null,
    p.mostRecentEpisodeDate,
    p.platforms.length ? "platforms" : null,
    p.audienceTags.length ? "tags" : null,
  ].filter(Boolean).length;
  return {
    id: p.slug,
    name: p.name,
    slug: p.slug,
    status: p.status,
    ownershipStatus: p.ownershipStatus,
    verificationStatus: p.verificationStatus,
    categories: [p.primaryCategory, ...p.secondaryCategories].filter(
      (x): x is string => Boolean(x),
    ),
    audienceTags: p.audienceTags,
    geography: { countryCode: p.country, state: p.stateOrRegion, city: p.city },
    mostRecentEpisodeDate: p.mostRecentEpisodeDate,
    advertisingAvailable: p.advertisingAvailable,
    dataFillRatio: filled / 7,
    inventory: [], // seed carries no structured inventory yet; filled on claim
    activeBoostScopes: [],
  };
}
