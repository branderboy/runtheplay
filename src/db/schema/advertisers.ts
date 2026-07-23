import {
  pgTable,
  uuid,
  text,
  jsonb,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

/**
 * Advertiser accounts, created at Finalize Plan (A4 in docs/logic.md).
 * Email-keyed: planning stays open, the account happens where the action is.
 */
export const advertisers = pgTable(
  "advertisers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull(),
    name: text("name"),
    company: text("company"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [uniqueIndex("advertisers_email_idx").on(t.email)],
);

/** A finalized media mix, retrievable at /plans/[id]. */
export const savedPlans = pgTable(
  "saved_plans",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    advertiserId: uuid("advertiser_id")
      .notNull()
      .references(() => advertisers.id, { onDelete: "cascade" }),
    itemsJson: jsonb("items_json").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [index("saved_plans_advertiser_idx").on(t.advertiserId)],
);
