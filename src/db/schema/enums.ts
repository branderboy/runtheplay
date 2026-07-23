import { pgEnum } from "drizzle-orm/pg-core";

/* ------------------------------ Podcast core ------------------------------ */

export const podcastStatus = pgEnum("podcast_status", [
  "active",
  "inactive",
  "archived",
  "rebranded",
  "needs_verification",
]);

export const ownershipStatus = pgEnum("ownership_status", [
  "unclaimed",
  "pending",
  "claimed",
]);

export const verificationStatus = pgEnum("verification_status", [
  "unverified",
  "verified",
  "disputed",
]);

export const independentOrNetwork = pgEnum("independent_or_network", [
  "independent",
  "network",
]);

export const platform = pgEnum("platform", [
  "apple",
  "spotify",
  "youtube",
  "instagram",
  "tiktok",
  "x",
  "website",
  "rss",
]);

/** Trust level of a stored metric / field. Mirrors the Data Sourcing spec. */
export const metricSource = pgEnum("metric_source", [
  "public",
  "public_snapshot",
  "owner_reported",
  "verified",
  "estimated",
]);

/** Research confidence label from the seed-list research brief. */
export const dataConfidence = pgEnum("data_confidence", [
  "verified",
  "owner_provided",
  "public_source",
  "cross_checked",
  "inferred",
  "unknown",
]);

export const audienceTagGroup = pgEnum("audience_tag_group", [
  "interest",
  "age",
  "profession",
  "culture",
  "life_stage",
]);

export const sourceType = pgEnum("source_type", [
  "rss",
  "website",
  "platform",
  "media_kit",
  "owner",
  "manual",
  "api",
  "search",
]);

/* --------------------------- Inventory taxonomy --------------------------- */
/* See docs/INVENTORY_TAXONOMY.md — five independent dimensions + video + social */

export const creativeFormat = pgEnum("creative_format", [
  "host_read",
  "voice_talent_ad",
  "advertiser_supplied_commercial",
  "custom_produced_commercial",
  "brand_mention",
  "product_mention_testimonial",
  "sponsored_segment",
  "sponsored_interview",
  "branded_episode",
  "branded_series",
  "custom_editorial_integration",
]);

export const sponsorshipType = pgEnum("sponsorship_type", [
  "episode",
  "presenting",
  "segment",
  "season",
  "series",
  "show",
  "network",
  "category_exclusive",
  "title",
  "launch",
]);

export const deliveryMethod = pgEnum("delivery_method", [
  "baked_in",
  "dynamic_insertion",
  "streaming_insertion",
]);

export const mediaType = pgEnum("media_type", ["audio", "video", "both"]);

export const placementType = pgEnum("placement_type", [
  "pre_roll",
  "mid_roll",
  "post_roll",
  "cold_open",
  "opening_mention",
  "closing_mention",
  "in_conversation",
  "full_episode_takeover",
  "ad_break_takeover",
]);

export const deliveryTargeting = pgEnum("delivery_targeting", [
  "run_of_show",
  "run_of_network",
  "audience_targeted",
  "contextual",
]);

export const videoFeature = pgEnum("video_feature", [
  "video_host_read",
  "product_placement",
  "product_demonstration",
  "branded_set_placement",
  "on_screen_graphic",
  "video_commercial_insert",
  "pinned_comment",
  "description_link",
  "thumbnail_integration",
]);

export const socialAddon = pgEnum("social_addon", [
  "instagram_reel",
  "instagram_feed_post",
  "instagram_story",
  "tiktok_video",
  "youtube_short",
  "podcast_clip_sponsorship",
  "branded_clip",
  "collaboration_post",
  "link_in_bio",
  "pinned_social_post",
  "social_caption_mention",
  "host_account_repost",
  "giveaway",
  "livestream_mention",
  "community_post",
  "email_newsletter_mention",
  "website_article",
  "website_banner",
  "episode_page_placement",
]);

export const pricingModel = pgEnum("pricing_model", [
  "flat_rate",
  "per_episode",
  "cpm",
  "package_price",
  "monthly_sponsorship",
  "seasonal_sponsorship",
  "starting_at",
  "contact_for_pricing",
  "value_exchange",
  "custom_quote",
]);

export const availabilityStatus = pgEnum("availability_status", [
  "active",
  "paused",
  "unavailable",
  "archived",
]);

/* -------------------------------- Newsletter ------------------------------- */

export const subscriberStatus = pgEnum("subscriber_status", [
  "pending",
  "confirmed",
  "unsubscribed",
  "bounced",
  "complained",
]);

export const newsletterEdition = pgEnum("newsletter_edition", [
  "buyer",
  "creator",
]);

export const issueStatus = pgEnum("issue_status", [
  "draft",
  "scheduled",
  "sent",
]);

export const sendStatus = pgEnum("send_status", [
  "queued",
  "sent",
  "delivered",
  "opened",
  "clicked",
  "bounced",
  "complained",
]);

export const suppressionReason = pgEnum("suppression_reason", [
  "unsubscribe",
  "bounce",
  "complaint",
  "manual",
]);

/* -------------------------------- Planning -------------------------------- */
/* Note: no political/advocacy goal — politics is out of scope. */
export const campaignGoal = pgEnum("campaign_goal", [
  "brand_awareness",
  "product_launch",
  "music_release",
  "event_promotion",
  "local_business",
  "lead_generation",
  "community_nonprofit",
  "recruiting",
  "other",
]);

export const planStatus = pgEnum("plan_status", ["draft", "active", "archived"]);

export const priceBasis = pgEnum("price_basis", [
  "listed",
  "starting",
  "user_estimate",
  "unknown",
]);

/* ---------------------- Promotions (Yelp-style boosts) --------------------- */
/* Free to list; pay to boost positioning. Boosts are labeled and never
   override organic relevance — see docs/MONETIZATION_AND_RANKING.md. */
export const boostScope = pgEnum("boost_scope", [
  "directory",
  "planner_results",
  "newsletter",
  "all",
]);

export const boostStatus = pgEnum("boost_status", [
  "scheduled",
  "active",
  "paused",
  "expired",
  "canceled",
]);

export const subscriptionStatus = pgEnum("subscription_status", [
  "trialing",
  "active",
  "past_due",
  "canceled",
  "unpaid",
]);

export const subscriptionProduct = pgEnum("subscription_product", [
  "boost_directory",
  "boost_planner_results",
  "boost_newsletter",
  "boost_all",
]);
