import {
  pgTable,
  uuid,
  text,
  integer,
  bigint,
  boolean,
  timestamp,
  primaryKey,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import {
  podcastStatus,
  ownershipStatus,
  verificationStatus,
  independentOrNetwork,
  platform,
  metricSource,
  dataConfidence,
  audienceTagGroup,
  sourceType,
} from "./enums";

/* --------------------------------- podcasts -------------------------------- */

export const podcasts = pgTable(
  "podcasts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    shortDescription: text("short_description"),
    fullDescription: text("full_description"),
    artworkUrl: text("artwork_url"),
    officialWebsite: text("official_website"),
    rssUrl: text("rss_url"),

    networkName: text("network_name"),
    independentOrNetwork: independentOrNetwork("independent_or_network"),

    primaryLanguage: text("primary_language").default("en"),
    countryCode: text("country_code"),
    stateOrRegion: text("state_or_region"),
    city: text("city"),

    publishingFrequency: text("publishing_frequency"),
    averageEpisodeMinutes: integer("average_episode_minutes"),
    mostRecentEpisodeDate: text("most_recent_episode_date"),

    status: podcastStatus("status").notNull().default("active"),
    ownershipStatus: ownershipStatus("ownership_status")
      .notNull()
      .default("unclaimed"),
    verificationStatus: verificationStatus("verification_status")
      .notNull()
      .default("unverified"),

    advertisingAvailable: boolean("advertising_available"),
    advertisingContactUrl: text("advertising_contact_url"),
    advertisingContactEmail: text("advertising_contact_email"),
    mediaKitUrl: text("media_kit_url"),

    dataConfidence: dataConfidence("data_confidence").default("public_source"),
    lastResearchedAt: text("last_researched_at"),
    dataFreshnessAt: timestamp("data_freshness_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("podcasts_slug_idx").on(t.slug),
    index("podcasts_ownership_idx").on(t.ownershipStatus),
    index("podcasts_status_idx").on(t.status),
    index("podcasts_geo_idx").on(t.countryCode, t.stateOrRegion, t.city),
  ],
);

/* ---------------------------------- hosts ---------------------------------- */

export const hosts = pgTable(
  "hosts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    bio: text("bio"),
    imageUrl: text("image_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [uniqueIndex("hosts_slug_idx").on(t.slug)],
);

export const podcastHosts = pgTable(
  "podcast_hosts",
  {
    podcastId: uuid("podcast_id")
      .notNull()
      .references(() => podcasts.id, { onDelete: "cascade" }),
    hostId: uuid("host_id")
      .notNull()
      .references(() => hosts.id, { onDelete: "cascade" }),
    role: text("role").default("host"),
    displayOrder: integer("display_order").default(0),
  },
  (t) => [primaryKey({ columns: [t.podcastId, t.hostId] })],
);

/* -------------------------------- categories ------------------------------- */

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    parentId: uuid("parent_id"),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    indexable: boolean("indexable").default(false),
  },
  (t) => [uniqueIndex("categories_slug_idx").on(t.slug)],
);

export const podcastCategories = pgTable(
  "podcast_categories",
  {
    podcastId: uuid("podcast_id")
      .notNull()
      .references(() => podcasts.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    isPrimary: boolean("is_primary").default(false),
  },
  (t) => [primaryKey({ columns: [t.podcastId, t.categoryId] })],
);

/* ------------------------------- audience tags ----------------------------- */

export const audienceTags = pgTable(
  "audience_tags",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    groupName: audienceTagGroup("group_name").notNull().default("interest"),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
  },
  (t) => [uniqueIndex("audience_tags_slug_idx").on(t.slug)],
);

export const podcastAudienceTags = pgTable(
  "podcast_audience_tags",
  {
    podcastId: uuid("podcast_id")
      .notNull()
      .references(() => podcasts.id, { onDelete: "cascade" }),
    audienceTagId: uuid("audience_tag_id")
      .notNull()
      .references(() => audienceTags.id, { onDelete: "cascade" }),
    sourceType: metricSource("source_type").default("public"),
  },
  (t) => [primaryKey({ columns: [t.podcastId, t.audienceTagId] })],
);

/* ----------------------------- platform accounts --------------------------- */

export const podcastPlatforms = pgTable(
  "podcast_platforms",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    podcastId: uuid("podcast_id")
      .notNull()
      .references(() => podcasts.id, { onDelete: "cascade" }),
    platform: platform("platform").notNull(),
    profileUrl: text("profile_url"),
    handle: text("handle"),
    externalId: text("external_id"),
    followerCount: bigint("follower_count", { mode: "number" }),
    averageViews: bigint("average_views", { mode: "number" }),
    metricSource: metricSource("metric_source").default("public"),
    metricCapturedAt: text("metric_captured_at"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [
    uniqueIndex("podcast_platform_idx").on(t.podcastId, t.platform),
    index("platform_follower_idx").on(t.platform, t.followerCount),
  ],
);

/* ------------------------------ source records ----------------------------- */

export const sourceRecords = pgTable("source_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  podcastId: uuid("podcast_id").references(() => podcasts.id, {
    onDelete: "cascade",
  }),
  sourceType: sourceType("source_type").notNull(),
  sourceUrl: text("source_url"),
  note: text("note"),
  retrievedAt: timestamp("retrieved_at", { withTimezone: true }).defaultNow(),
});
