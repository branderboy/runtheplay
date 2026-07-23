import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";

/** Buyer inquiries sent from a profile's contact form. */
export const inquiries = pgTable(
  "inquiries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    podcastSlug: text("podcast_slug").notNull(),
    fromEmail: text("from_email").notNull(),
    message: text("message").notNull(),
    routedTo: text("routed_to"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [index("inquiries_podcast_idx").on(t.podcastSlug)],
);

/** Profile-claim attempts (email-on-file auto-verify or manual review). */
export const claims = pgTable(
  "claims",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    podcastSlug: text("podcast_slug").notNull(),
    claimEmail: text("claim_email").notNull(),
    role: text("role"),
    method: text("method").notNull(), // email_on_file | manual_review
    status: text("status").notNull(), // auto_verified | pending
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [index("claims_podcast_idx").on(t.podcastSlug)],
);
