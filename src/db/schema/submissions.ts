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

/** New-show sign-ups from creators whose show is not in the directory yet. */
export const listingRequests = pgTable(
  "listing_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    showName: text("show_name").notNull(),
    contactName: text("contact_name"),
    email: text("email").notNull(),
    showUrl: text("show_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [index("listing_requests_email_idx").on(t.email)],
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
