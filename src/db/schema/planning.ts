import {
  pgTable,
  uuid,
  text,
  numeric,
  integer,
  boolean,
  jsonb,
  date,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { podcasts } from "./podcasts";
import { inventoryItems } from "./inventory";
import {
  campaignGoal,
  planStatus,
  priceBasis,
  mediaType,
} from "./enums";

/* ------------------------------ campaign plans ----------------------------- */

export const campaignPlans = pgTable(
  "campaign_plans",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id"), // nullable — guests can plan before signing up
    name: text("name"),
    organizationName: text("organization_name"),
    goal: campaignGoal("goal").notNull(),
    messageSummary: text("message_summary"),
    budgetMin: numeric("budget_min"),
    budgetMax: numeric("budget_max"),
    currency: text("currency").default("USD"),
    startDate: date("start_date"),
    endDate: date("end_date"),
    mediaType: mediaType("media_type"),
    geographyJson: jsonb("geography_json"),
    audienceJson: jsonb("audience_json"),
    formatPreferencesJson: jsonb("format_preferences_json"),
    status: planStatus("status").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [index("campaign_plans_user_idx").on(t.userId)],
);

/* ----------------------------- campaign baskets ---------------------------- */

export const campaignBaskets = pgTable(
  "campaign_baskets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    campaignPlanId: uuid("campaign_plan_id")
      .notNull()
      .references(() => campaignPlans.id, { onDelete: "cascade" }),
    shareTokenHash: text("share_token_hash"),
    sharingEnabled: boolean("sharing_enabled").default(false),
    showNotesOnShare: boolean("show_notes_on_share").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [uniqueIndex("campaign_baskets_plan_idx").on(t.campaignPlanId)],
);

export const basketItems = pgTable(
  "basket_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    basketId: uuid("basket_id")
      .notNull()
      .references(() => campaignBaskets.id, { onDelete: "cascade" }),
    podcastId: uuid("podcast_id")
      .notNull()
      .references(() => podcasts.id, { onDelete: "cascade" }),
    inventoryItemId: uuid("inventory_item_id").references(
      () => inventoryItems.id,
      { onDelete: "set null" },
    ),
    quantity: integer("quantity").default(1),
    priceBasis: priceBasis("price_basis").notNull().default("unknown"),
    plannedUnitPrice: numeric("planned_unit_price"),
    notes: text("notes"),
    displayOrder: integer("display_order").default(0),
    matchScore: numeric("match_score"),
    matchReasons: jsonb("match_reasons"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [
    index("basket_items_basket_idx").on(t.basketId),
    uniqueIndex("basket_items_unique_idx").on(
      t.basketId,
      t.podcastId,
      t.inventoryItemId,
    ),
  ],
);

/* -------------------------- recommendation history ------------------------- */

export const recommendationRuns = pgTable("recommendation_runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  campaignPlanId: uuid("campaign_plan_id")
    .notNull()
    .references(() => campaignPlans.id, { onDelete: "cascade" }),
  algorithmVersion: text("algorithm_version").notNull(),
  inputSnapshot: jsonb("input_snapshot"),
  generatedAt: timestamp("generated_at", { withTimezone: true }).defaultNow(),
});

export const recommendationResults = pgTable(
  "recommendation_results",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    recommendationRunId: uuid("recommendation_run_id")
      .notNull()
      .references(() => recommendationRuns.id, { onDelete: "cascade" }),
    podcastId: uuid("podcast_id")
      .notNull()
      .references(() => podcasts.id, { onDelete: "cascade" }),
    inventoryItemId: uuid("inventory_item_id").references(
      () => inventoryItems.id,
      { onDelete: "set null" },
    ),
    score: numeric("score").notNull(),
    reasons: jsonb("reasons"),
    rank: integer("rank").notNull(),
    isSponsored: boolean("is_sponsored").notNull().default(false),
  },
  (t) => [index("recommendation_results_run_idx").on(t.recommendationRunId)],
);
