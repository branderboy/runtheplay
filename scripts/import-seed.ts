/**
 * Imports data/seed/podcasts_seed.csv into the directory tables.
 * Idempotent: upserts podcasts by slug, and platform/host/category/tag links
 * are conflict-safe, so re-running refreshes rather than duplicates.
 *
 *   npm run db:seed
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { parse } from "csv-parse/sync";
import { db, sql } from "../src/db/client";
import {
  podcasts,
  hosts,
  podcastHosts,
  categories,
  podcastCategories,
  audienceTags,
  podcastAudienceTags,
  podcastPlatforms,
  sourceRecords,
} from "../src/db/schema/index";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CSV_PATH = resolve(__dirname, "../data/seed/podcasts_seed.csv");

/* --------------------------------- helpers -------------------------------- */

const clean = (v: string | undefined): string | null => {
  if (v == null) return null;
  const t = v.trim();
  if (t === "" || t.toUpperCase() === "NEEDS_VERIFICATION") return null;
  return t;
};

const slugify = (s: string): string =>
  s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const parseCount = (v: string | undefined): number | null => {
  const t = clean(v);
  if (!t) return null;
  const m = /(\d+(?:\.\d+)?)\s*([kmb]?)/i.exec(t.replace(/,/g, ""));
  if (!m) return null;
  let n = parseFloat(m[1]);
  const suf = (m[2] || "").toLowerCase();
  if (suf === "k") n *= 1e3;
  else if (suf === "m") n *= 1e6;
  else if (suf === "b") n *= 1e9;
  return Math.round(n);
};

const parseIntSafe = (v: string | undefined): number | null => {
  const t = clean(v);
  if (!t) return null;
  const n = parseInt(t.replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) ? n : null;
};

const oneOf = <T extends string>(
  v: string | undefined,
  allowed: readonly T[],
  fallback: T | null = null,
): T | null => {
  const t = clean(v);
  if (!t) return fallback;
  const norm = t.toLowerCase().replace(/\s+/g, "_");
  return (allowed as readonly string[]).includes(norm) ? (norm as T) : fallback;
};

const splitMulti = (v: string | undefined): string[] => {
  const t = clean(v);
  if (!t) return [];
  return t
    .split(/[|]/)
    .map((s) => s.trim())
    .filter(Boolean);
};

const splitHosts = (v: string | undefined): string[] => {
  const t = clean(v);
  if (!t) return [];
  return t
    .split(/\s*(?:,|&|\/| and )\s*/i)
    .map((s) => s.trim())
    .filter((s) => s && s.toUpperCase() !== "NEEDS_VERIFICATION");
};

const countryToCode = (v: string | undefined): string | null => {
  const t = clean(v);
  if (!t) return null;
  const map: Record<string, string> = {
    "united states": "US",
    usa: "US",
    us: "US",
    "united kingdom": "GB",
    uk: "GB",
    canada: "CA",
  };
  return map[t.toLowerCase()] ?? (t.length === 2 ? t.toUpperCase() : null);
};

const STATUS = ["active", "inactive", "archived", "rebranded", "needs_verification"] as const;
const CONFIDENCE = ["verified", "owner_provided", "public_source", "cross_checked", "inferred", "unknown"] as const;
const INDNET = ["independent", "network"] as const;

const mapStatus = (v: string | undefined) => {
  const t = clean(v)?.toLowerCase() ?? "";
  if (["active", "yes"].includes(t)) return "active" as const;
  if (t.includes("rebrand")) return "rebranded" as const;
  if (t.includes("inactive") || t.includes("hiatus") || t.includes("ended")) return "inactive" as const;
  return oneOf(v, STATUS, "active")!;
};

/* --------------------------------- upserts -------------------------------- */

async function upsertPodcast(row: Record<string, string>): Promise<string> {
  const name = clean(row.podcast_name)!;
  const slug = clean(row.slug) ?? slugify(name);
  const [rec] = await db
    .insert(podcasts)
    .values({
      name,
      slug,
      shortDescription: clean(row.short_description),
      artworkUrl: clean(row.artwork_url),
      officialWebsite: clean(row.official_website),
      rssUrl: clean(row.rss_url),
      networkName: clean(row.network_name),
      independentOrNetwork: oneOf(row.independent_or_network, INDNET),
      primaryLanguage: clean(row.primary_language) ?? "en",
      countryCode: countryToCode(row.country),
      stateOrRegion: clean(row.state_or_region),
      city: clean(row.city),
      publishingFrequency: clean(row.publishing_frequency),
      averageEpisodeMinutes: parseIntSafe(row.average_episode_minutes),
      mostRecentEpisodeDate: clean(row.most_recent_episode_date),
      status: mapStatus(row.active_status),
      advertisingAvailable:
        clean(row.advertising_available)?.toLowerCase() === "yes"
          ? true
          : clean(row.advertising_available)?.toLowerCase() === "no"
            ? false
            : null,
      advertisingContactUrl: clean(row.advertising_contact_url),
      advertisingContactEmail: clean(row.advertising_contact_email),
      mediaKitUrl: clean(row.media_kit_url),
      dataConfidence: oneOf(row.data_confidence, CONFIDENCE, "public_source"),
      lastResearchedAt: clean(row.last_researched_at),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: podcasts.slug,
      set: {
        name,
        shortDescription: clean(row.short_description),
        officialWebsite: clean(row.official_website),
        networkName: clean(row.network_name),
        status: mapStatus(row.active_status),
        advertisingContactEmail: clean(row.advertising_contact_email),
        updatedAt: new Date(),
      },
    })
    .returning({ id: podcasts.id });
  return rec.id;
}

async function linkHosts(podcastId: string, row: Record<string, string>) {
  const names = splitHosts(row.host_names);
  for (let i = 0; i < names.length; i++) {
    const hslug = slugify(names[i]);
    if (!hslug) continue;
    const [h] = await db
      .insert(hosts)
      .values({ name: names[i], slug: hslug })
      .onConflictDoUpdate({ target: hosts.slug, set: { name: names[i] } })
      .returning({ id: hosts.id });
    await db
      .insert(podcastHosts)
      .values({ podcastId, hostId: h.id, displayOrder: i })
      .onConflictDoNothing();
  }
}

async function linkCategories(podcastId: string, row: Record<string, string>) {
  const primary = clean(row.primary_category);
  const entries: Array<[string, boolean]> = [];
  if (primary) entries.push([primary, true]);
  for (const c of splitMulti(row.secondary_categories)) entries.push([c, false]);
  for (const [nameRaw, isPrimary] of entries) {
    const cslug = slugify(nameRaw);
    if (!cslug) continue;
    const [c] = await db
      .insert(categories)
      .values({ name: nameRaw, slug: cslug })
      .onConflictDoUpdate({ target: categories.slug, set: { name: nameRaw } })
      .returning({ id: categories.id });
    await db
      .insert(podcastCategories)
      .values({ podcastId, categoryId: c.id, isPrimary })
      .onConflictDoNothing();
  }
}

async function linkAudienceTags(podcastId: string, row: Record<string, string>) {
  for (const tagRaw of splitMulti(row.audience_tags)) {
    const tslug = slugify(tagRaw);
    if (!tslug) continue;
    const [t] = await db
      .insert(audienceTags)
      .values({ name: tagRaw, slug: tslug, groupName: "interest" })
      .onConflictDoUpdate({ target: audienceTags.slug, set: { name: tagRaw } })
      .returning({ id: audienceTags.id });
    await db
      .insert(podcastAudienceTags)
      .values({ podcastId, audienceTagId: t.id })
      .onConflictDoNothing();
  }
}

async function linkPlatforms(podcastId: string, row: Record<string, string>) {
  const capturedAt = clean(row.last_researched_at);
  const defs: Array<{
    platform: "youtube" | "instagram" | "tiktok" | "x" | "apple" | "spotify" | "website";
    url: string | undefined;
    followers?: string | undefined;
    views?: string | undefined;
  }> = [
    { platform: "youtube", url: row.youtube_url, followers: row.youtube_subscribers, views: row.average_video_views },
    { platform: "instagram", url: row.instagram_url, followers: row.instagram_followers },
    { platform: "tiktok", url: row.tiktok_url, followers: row.tiktok_followers },
    { platform: "x", url: row.x_url },
    { platform: "apple", url: row.apple_url },
    { platform: "spotify", url: row.spotify_url },
    { platform: "website", url: row.official_website },
  ];
  for (const d of defs) {
    const url = clean(d.url);
    if (!url) continue;
    await db
      .insert(podcastPlatforms)
      .values({
        podcastId,
        platform: d.platform,
        profileUrl: url,
        followerCount: parseCount(d.followers),
        averageViews: parseCount(d.views),
        metricSource: "public",
        metricCapturedAt: capturedAt,
      })
      .onConflictDoNothing();
  }
}

async function linkSources(podcastId: string, row: Record<string, string>) {
  for (const u of [clean(row.primary_source_url), clean(row.secondary_source_url)]) {
    if (!u) continue;
    await db.insert(sourceRecords).values({
      podcastId,
      sourceType: "search",
      sourceUrl: u,
      note: clean(row.researcher_notes)?.slice(0, 500) ?? null,
    });
  }
}

/* ---------------------------------- main ---------------------------------- */

async function main() {
  const csv = readFileSync(CSV_PATH, "utf8");
  const rows: Record<string, string>[] = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  console.log(`Importing ${rows.length} podcasts from ${CSV_PATH}`);
  let ok = 0;
  for (const row of rows) {
    if (!clean(row.podcast_name)) continue;
    try {
      const id = await upsertPodcast(row);
      await linkHosts(id, row);
      await linkCategories(id, row);
      await linkAudienceTags(id, row);
      await linkPlatforms(id, row);
      await linkSources(id, row);
      ok++;
      console.log(`  ✓ ${row.podcast_name}`);
    } catch (err) {
      console.error(`  ✗ ${row.podcast_name}:`, (err as Error).message);
    }
  }
  console.log(`Done. Imported ${ok}/${rows.length} podcasts.`);
  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
