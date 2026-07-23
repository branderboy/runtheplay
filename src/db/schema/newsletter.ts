import {
  pgTable,
  uuid,
  text,
  jsonb,
  timestamp,
  date,
  primaryKey,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { podcasts } from "./podcasts";
import {
  subscriberStatus,
  newsletterEdition,
  issueStatus,
  sendStatus,
  suppressionReason,
} from "./enums";

/** See docs/NEWSLETTER_COMPONENT.md — two editions, opt-in, suppression-aware. */

export const newsletterSubscribers = pgTable(
  "newsletter_subscribers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull(),
    status: subscriberStatus("status").notNull().default("pending"),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
    consentSource: text("consent_source"),
    consentIp: text("consent_ip"),
    countryCode: text("country_code"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [uniqueIndex("newsletter_subscribers_email_idx").on(t.email)],
);

export const newsletterEditionSubscriptions = pgTable(
  "newsletter_edition_subscriptions",
  {
    subscriberId: uuid("subscriber_id")
      .notNull()
      .references(() => newsletterSubscribers.id, { onDelete: "cascade" }),
    edition: newsletterEdition("edition").notNull(),
    subscribedAt: timestamp("subscribed_at", { withTimezone: true }).defaultNow(),
    unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
  },
  (t) => [primaryKey({ columns: [t.subscriberId, t.edition] })],
);

export const newsletterIssues = pgTable("newsletter_issues", {
  id: uuid("id").defaultRandom().primaryKey(),
  edition: newsletterEdition("edition").notNull(),
  subject: text("subject").notNull(),
  periodStart: date("period_start"),
  periodEnd: date("period_end"),
  // audit trail: which chart/metric snapshot ids appeared in this issue
  snapshotManifest: jsonb("snapshot_manifest"),
  status: issueStatus("status").notNull().default("draft"),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const newsletterSends = pgTable(
  "newsletter_sends",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    issueId: uuid("issue_id")
      .notNull()
      .references(() => newsletterIssues.id, { onDelete: "cascade" }),
    subscriberId: uuid("subscriber_id")
      .notNull()
      .references(() => newsletterSubscribers.id, { onDelete: "cascade" }),
    status: sendStatus("status").notNull().default("queued"),
    providerMessageId: text("provider_message_id"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [index("newsletter_sends_issue_idx").on(t.issueId)],
);

/** Honored before EVERY send — newsletter AND cold outreach. */
export const emailSuppressions = pgTable(
  "email_suppressions",
  {
    email: text("email").primaryKey(),
    reason: suppressionReason("reason").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
);

/**
 * Links a subscriber to podcasts they follow / own, so the creator edition can
 * personalize ("your show charted"). Generic issues ship first; personalization
 * switches on once this is populated (open decision #6 in the newsletter spec).
 */
export const newsletterFollowedPodcasts = pgTable(
  "newsletter_followed_podcasts",
  {
    subscriberId: uuid("subscriber_id")
      .notNull()
      .references(() => newsletterSubscribers.id, { onDelete: "cascade" }),
    podcastId: uuid("podcast_id")
      .notNull()
      .references(() => podcasts.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.subscriberId, t.podcastId] })],
);
