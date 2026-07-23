import {
  pgTable,
  uuid,
  text,
  jsonb,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

/**
 * Creator Studio profiles (P6 in docs/logic.md): what a verified or
 * newly-signed-up creator publishes — thumbnail, details, and inventory.
 * The public profile overlays this data once status is "published".
 */
export const creatorProfiles = pgTable(
  "creator_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    podcastSlug: text("podcast_slug").notNull(),
    showName: text("show_name"),
    contactEmail: text("contact_email"),
    thumbnailUrl: text("thumbnail_url"),
    description: text("description"),
    inventoryJson: jsonb("inventory_json").notNull().default([]),
    status: text("status").notNull().default("draft"), // draft | published
    source: text("source").notNull(), // claim | listing
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [index("creator_profiles_slug_idx").on(t.podcastSlug)],
);

/** Support tickets, managed from /admin. */
export const supportTickets = pgTable(
  "support_tickets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull(),
    topic: text("topic"),
    message: text("message").notNull(),
    status: text("status").notNull().default("open"), // open | closed
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [index("support_tickets_status_idx").on(t.status)],
);
