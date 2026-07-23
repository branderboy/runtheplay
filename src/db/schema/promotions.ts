import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { podcasts } from "./podcasts";
import {
  boostScope,
  boostStatus,
  subscriptionStatus,
  subscriptionProduct,
} from "./enums";

/**
 * Yelp-style listing boosts. Listing is free; a podcast pays to boost its
 * POSITIONING on a given surface (directory, planner results, newsletter, or
 * all). A boost grants a labeled "Featured" slot — it never rewrites organic
 * relevance or match scores. See docs/MONETIZATION_AND_RANKING.md.
 */
export const listingBoosts = pgTable(
  "listing_boosts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    podcastId: uuid("podcast_id")
      .notNull()
      .references(() => podcasts.id, { onDelete: "cascade" }),
    scope: boostScope("scope").notNull(),
    status: boostStatus("status").notNull().default("scheduled"),
    // Higher priority wins a more prominent featured slot when boosts compete.
    priority: integer("priority").notNull().default(0),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    subscriptionId: uuid("subscription_id").references(() => subscriptions.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [
    index("listing_boosts_podcast_idx").on(t.podcastId),
    index("listing_boosts_active_idx").on(t.scope, t.status, t.endsAt),
  ],
);

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    podcastId: uuid("podcast_id")
      .notNull()
      .references(() => podcasts.id, { onDelete: "cascade" }),
    product: subscriptionProduct("product").notNull(),
    status: subscriptionStatus("status").notNull().default("trialing"),
    providerCustomerId: text("provider_customer_id"),
    providerSubscriptionId: text("provider_subscription_id"),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [index("subscriptions_podcast_idx").on(t.podcastId)],
);
