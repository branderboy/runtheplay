import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";
import { podcasts } from "./podcasts";
import {
  creativeFormat,
  sponsorshipType,
  deliveryMethod,
  mediaType,
  placementType,
  deliveryTargeting,
  videoFeature,
  socialAddon,
  pricingModel,
  availabilityStatus,
} from "./enums";

/**
 * An advertising opportunity is several independent characteristics at once.
 * One-per-opportunity dimensions are columns; many-per-opportunity dimensions
 * (placement, delivery targeting, video features, social add-ons) are join
 * tables. See docs/INVENTORY_TAXONOMY.md.
 */
export const inventoryItems = pgTable(
  "inventory_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    podcastId: uuid("podcast_id")
      .notNull()
      .references(() => podcasts.id, { onDelete: "cascade" }),

    opportunityName: text("opportunity_name").notNull(),

    // one-per-opportunity dimensions
    creativeFormat: creativeFormat("creative_format").notNull(),
    sponsorshipType: sponsorshipType("sponsorship_type"),
    deliveryMethod: deliveryMethod("delivery_method").notNull(),
    mediaType: mediaType("media_type").notNull().default("audio"),

    durationSeconds: integer("duration_seconds"),
    minEpisodes: integer("min_episodes"),
    packageEpisodes: integer("package_episodes"),
    exclusivityAvailable: boolean("exclusivity_available").default(false),

    // pricing
    pricingModel: pricingModel("pricing_model")
      .notNull()
      .default("contact_for_pricing"),
    priceStarting: numeric("price_starting"),
    priceMax: numeric("price_max"),
    currency: text("currency").default("USD"),

    availabilityStatus: availabilityStatus("availability_status")
      .notNull()
      .default("active"),
    leadTimeDays: integer("lead_time_days"),
    categoryRestrictions: text("category_restrictions"),
    creativeRequirements: text("creative_requirements"),
    preferredContactMethod: text("preferred_contact_method"),

    lastConfirmedAt: timestamp("last_confirmed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [
    index("inventory_podcast_idx").on(t.podcastId),
    index("inventory_format_idx").on(t.creativeFormat),
    index("inventory_availability_idx").on(t.availabilityStatus),
  ],
);

/* ---------------------- multi-select dimension tables ---------------------- */

export const inventoryPlacements = pgTable(
  "inventory_placements",
  {
    inventoryItemId: uuid("inventory_item_id")
      .notNull()
      .references(() => inventoryItems.id, { onDelete: "cascade" }),
    placement: placementType("placement").notNull(),
  },
  (t) => [primaryKey({ columns: [t.inventoryItemId, t.placement] })],
);

export const inventoryDeliveryTargeting = pgTable(
  "inventory_delivery_targeting",
  {
    inventoryItemId: uuid("inventory_item_id")
      .notNull()
      .references(() => inventoryItems.id, { onDelete: "cascade" }),
    targeting: deliveryTargeting("targeting").notNull(),
  },
  (t) => [primaryKey({ columns: [t.inventoryItemId, t.targeting] })],
);

export const inventoryVideoFeatures = pgTable(
  "inventory_video_features",
  {
    inventoryItemId: uuid("inventory_item_id")
      .notNull()
      .references(() => inventoryItems.id, { onDelete: "cascade" }),
    feature: videoFeature("feature").notNull(),
  },
  (t) => [primaryKey({ columns: [t.inventoryItemId, t.feature] })],
);

export const inventorySocialAddons = pgTable(
  "inventory_social_addons",
  {
    inventoryItemId: uuid("inventory_item_id")
      .notNull()
      .references(() => inventoryItems.id, { onDelete: "cascade" }),
    addon: socialAddon("addon").notNull(),
  },
  (t) => [primaryKey({ columns: [t.inventoryItemId, t.addon] })],
);
