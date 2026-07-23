CREATE TYPE "public"."audience_tag_group" AS ENUM('interest', 'age', 'profession', 'culture', 'life_stage');--> statement-breakpoint
CREATE TYPE "public"."availability_status" AS ENUM('active', 'paused', 'unavailable', 'archived');--> statement-breakpoint
CREATE TYPE "public"."creative_format" AS ENUM('host_read', 'voice_talent_ad', 'advertiser_supplied_commercial', 'custom_produced_commercial', 'brand_mention', 'product_mention_testimonial', 'sponsored_segment', 'sponsored_interview', 'branded_episode', 'branded_series', 'custom_editorial_integration');--> statement-breakpoint
CREATE TYPE "public"."data_confidence" AS ENUM('verified', 'owner_provided', 'public_source', 'cross_checked', 'inferred', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."delivery_method" AS ENUM('baked_in', 'dynamic_insertion', 'streaming_insertion');--> statement-breakpoint
CREATE TYPE "public"."delivery_targeting" AS ENUM('run_of_show', 'run_of_network', 'audience_targeted', 'contextual');--> statement-breakpoint
CREATE TYPE "public"."independent_or_network" AS ENUM('independent', 'network');--> statement-breakpoint
CREATE TYPE "public"."issue_status" AS ENUM('draft', 'scheduled', 'sent');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('audio', 'video', 'both');--> statement-breakpoint
CREATE TYPE "public"."metric_source" AS ENUM('public', 'public_snapshot', 'owner_reported', 'verified', 'estimated');--> statement-breakpoint
CREATE TYPE "public"."newsletter_edition" AS ENUM('buyer', 'creator');--> statement-breakpoint
CREATE TYPE "public"."ownership_status" AS ENUM('unclaimed', 'pending', 'claimed');--> statement-breakpoint
CREATE TYPE "public"."placement_type" AS ENUM('pre_roll', 'mid_roll', 'post_roll', 'cold_open', 'opening_mention', 'closing_mention', 'in_conversation', 'full_episode_takeover', 'ad_break_takeover');--> statement-breakpoint
CREATE TYPE "public"."platform" AS ENUM('apple', 'spotify', 'youtube', 'instagram', 'tiktok', 'x', 'website', 'rss');--> statement-breakpoint
CREATE TYPE "public"."podcast_status" AS ENUM('active', 'inactive', 'archived', 'rebranded', 'needs_verification');--> statement-breakpoint
CREATE TYPE "public"."pricing_model" AS ENUM('flat_rate', 'per_episode', 'cpm', 'package_price', 'monthly_sponsorship', 'seasonal_sponsorship', 'starting_at', 'contact_for_pricing', 'value_exchange', 'custom_quote');--> statement-breakpoint
CREATE TYPE "public"."send_status" AS ENUM('queued', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained');--> statement-breakpoint
CREATE TYPE "public"."social_addon" AS ENUM('instagram_reel', 'instagram_feed_post', 'instagram_story', 'tiktok_video', 'youtube_short', 'podcast_clip_sponsorship', 'branded_clip', 'collaboration_post', 'link_in_bio', 'pinned_social_post', 'social_caption_mention', 'host_account_repost', 'giveaway', 'livestream_mention', 'community_post', 'email_newsletter_mention', 'website_article', 'website_banner', 'episode_page_placement');--> statement-breakpoint
CREATE TYPE "public"."source_type" AS ENUM('rss', 'website', 'platform', 'media_kit', 'owner', 'manual', 'api', 'search');--> statement-breakpoint
CREATE TYPE "public"."sponsorship_type" AS ENUM('episode', 'presenting', 'segment', 'season', 'series', 'show', 'network', 'category_exclusive', 'title', 'launch');--> statement-breakpoint
CREATE TYPE "public"."subscriber_status" AS ENUM('pending', 'confirmed', 'unsubscribed', 'bounced', 'complained');--> statement-breakpoint
CREATE TYPE "public"."suppression_reason" AS ENUM('unsubscribe', 'bounce', 'complaint', 'manual');--> statement-breakpoint
CREATE TYPE "public"."verification_status" AS ENUM('unverified', 'verified', 'disputed');--> statement-breakpoint
CREATE TYPE "public"."video_feature" AS ENUM('video_host_read', 'product_placement', 'product_demonstration', 'branded_set_placement', 'on_screen_graphic', 'video_commercial_insert', 'pinned_comment', 'description_link', 'thumbnail_integration');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audience_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_name" "audience_tag_group" DEFAULT 'interest' NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"indexable" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hosts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"bio" text,
	"image_url" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "podcast_audience_tags" (
	"podcast_id" uuid NOT NULL,
	"audience_tag_id" uuid NOT NULL,
	"source_type" "metric_source" DEFAULT 'public',
	CONSTRAINT "podcast_audience_tags_podcast_id_audience_tag_id_pk" PRIMARY KEY("podcast_id","audience_tag_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "podcast_categories" (
	"podcast_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"is_primary" boolean DEFAULT false,
	CONSTRAINT "podcast_categories_podcast_id_category_id_pk" PRIMARY KEY("podcast_id","category_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "podcast_hosts" (
	"podcast_id" uuid NOT NULL,
	"host_id" uuid NOT NULL,
	"role" text DEFAULT 'host',
	"display_order" integer DEFAULT 0,
	CONSTRAINT "podcast_hosts_podcast_id_host_id_pk" PRIMARY KEY("podcast_id","host_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "podcast_platforms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"podcast_id" uuid NOT NULL,
	"platform" "platform" NOT NULL,
	"profile_url" text,
	"handle" text,
	"external_id" text,
	"follower_count" bigint,
	"average_views" bigint,
	"metric_source" "metric_source" DEFAULT 'public',
	"metric_captured_at" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "podcasts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"short_description" text,
	"full_description" text,
	"artwork_url" text,
	"official_website" text,
	"rss_url" text,
	"network_name" text,
	"independent_or_network" "independent_or_network",
	"primary_language" text DEFAULT 'en',
	"country_code" text,
	"state_or_region" text,
	"city" text,
	"publishing_frequency" text,
	"average_episode_minutes" integer,
	"most_recent_episode_date" text,
	"status" "podcast_status" DEFAULT 'active' NOT NULL,
	"ownership_status" "ownership_status" DEFAULT 'unclaimed' NOT NULL,
	"verification_status" "verification_status" DEFAULT 'unverified' NOT NULL,
	"advertising_available" boolean,
	"advertising_contact_url" text,
	"advertising_contact_email" text,
	"media_kit_url" text,
	"data_confidence" "data_confidence" DEFAULT 'public_source',
	"last_researched_at" text,
	"data_freshness_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "source_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"podcast_id" uuid,
	"source_type" "source_type" NOT NULL,
	"source_url" text,
	"note" text,
	"retrieved_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inventory_delivery_targeting" (
	"inventory_item_id" uuid NOT NULL,
	"targeting" "delivery_targeting" NOT NULL,
	CONSTRAINT "inventory_delivery_targeting_inventory_item_id_targeting_pk" PRIMARY KEY("inventory_item_id","targeting")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inventory_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"podcast_id" uuid NOT NULL,
	"opportunity_name" text NOT NULL,
	"creative_format" "creative_format" NOT NULL,
	"sponsorship_type" "sponsorship_type",
	"delivery_method" "delivery_method" NOT NULL,
	"media_type" "media_type" DEFAULT 'audio' NOT NULL,
	"duration_seconds" integer,
	"min_episodes" integer,
	"package_episodes" integer,
	"exclusivity_available" boolean DEFAULT false,
	"pricing_model" "pricing_model" DEFAULT 'contact_for_pricing' NOT NULL,
	"price_starting" numeric,
	"price_max" numeric,
	"currency" text DEFAULT 'USD',
	"availability_status" "availability_status" DEFAULT 'active' NOT NULL,
	"lead_time_days" integer,
	"category_restrictions" text,
	"creative_requirements" text,
	"preferred_contact_method" text,
	"last_confirmed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inventory_placements" (
	"inventory_item_id" uuid NOT NULL,
	"placement" "placement_type" NOT NULL,
	CONSTRAINT "inventory_placements_inventory_item_id_placement_pk" PRIMARY KEY("inventory_item_id","placement")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inventory_social_addons" (
	"inventory_item_id" uuid NOT NULL,
	"addon" "social_addon" NOT NULL,
	CONSTRAINT "inventory_social_addons_inventory_item_id_addon_pk" PRIMARY KEY("inventory_item_id","addon")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inventory_video_features" (
	"inventory_item_id" uuid NOT NULL,
	"feature" "video_feature" NOT NULL,
	CONSTRAINT "inventory_video_features_inventory_item_id_feature_pk" PRIMARY KEY("inventory_item_id","feature")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "email_suppressions" (
	"email" text PRIMARY KEY NOT NULL,
	"reason" "suppression_reason" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "newsletter_edition_subscriptions" (
	"subscriber_id" uuid NOT NULL,
	"edition" "newsletter_edition" NOT NULL,
	"subscribed_at" timestamp with time zone DEFAULT now(),
	"unsubscribed_at" timestamp with time zone,
	CONSTRAINT "newsletter_edition_subscriptions_subscriber_id_edition_pk" PRIMARY KEY("subscriber_id","edition")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "newsletter_followed_podcasts" (
	"subscriber_id" uuid NOT NULL,
	"podcast_id" uuid NOT NULL,
	CONSTRAINT "newsletter_followed_podcasts_subscriber_id_podcast_id_pk" PRIMARY KEY("subscriber_id","podcast_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "newsletter_issues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"edition" "newsletter_edition" NOT NULL,
	"subject" text NOT NULL,
	"period_start" date,
	"period_end" date,
	"snapshot_manifest" jsonb,
	"status" "issue_status" DEFAULT 'draft' NOT NULL,
	"scheduled_at" timestamp with time zone,
	"sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "newsletter_sends" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"issue_id" uuid NOT NULL,
	"subscriber_id" uuid NOT NULL,
	"status" "send_status" DEFAULT 'queued' NOT NULL,
	"provider_message_id" text,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "newsletter_subscribers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"status" "subscriber_status" DEFAULT 'pending' NOT NULL,
	"confirmed_at" timestamp with time zone,
	"consent_source" text,
	"consent_ip" text,
	"country_code" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "podcast_audience_tags" ADD CONSTRAINT "podcast_audience_tags_podcast_id_podcasts_id_fk" FOREIGN KEY ("podcast_id") REFERENCES "public"."podcasts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "podcast_audience_tags" ADD CONSTRAINT "podcast_audience_tags_audience_tag_id_audience_tags_id_fk" FOREIGN KEY ("audience_tag_id") REFERENCES "public"."audience_tags"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "podcast_categories" ADD CONSTRAINT "podcast_categories_podcast_id_podcasts_id_fk" FOREIGN KEY ("podcast_id") REFERENCES "public"."podcasts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "podcast_categories" ADD CONSTRAINT "podcast_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "podcast_hosts" ADD CONSTRAINT "podcast_hosts_podcast_id_podcasts_id_fk" FOREIGN KEY ("podcast_id") REFERENCES "public"."podcasts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "podcast_hosts" ADD CONSTRAINT "podcast_hosts_host_id_hosts_id_fk" FOREIGN KEY ("host_id") REFERENCES "public"."hosts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "podcast_platforms" ADD CONSTRAINT "podcast_platforms_podcast_id_podcasts_id_fk" FOREIGN KEY ("podcast_id") REFERENCES "public"."podcasts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "source_records" ADD CONSTRAINT "source_records_podcast_id_podcasts_id_fk" FOREIGN KEY ("podcast_id") REFERENCES "public"."podcasts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_delivery_targeting" ADD CONSTRAINT "inventory_delivery_targeting_inventory_item_id_inventory_items_id_fk" FOREIGN KEY ("inventory_item_id") REFERENCES "public"."inventory_items"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_podcast_id_podcasts_id_fk" FOREIGN KEY ("podcast_id") REFERENCES "public"."podcasts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_placements" ADD CONSTRAINT "inventory_placements_inventory_item_id_inventory_items_id_fk" FOREIGN KEY ("inventory_item_id") REFERENCES "public"."inventory_items"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_social_addons" ADD CONSTRAINT "inventory_social_addons_inventory_item_id_inventory_items_id_fk" FOREIGN KEY ("inventory_item_id") REFERENCES "public"."inventory_items"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_video_features" ADD CONSTRAINT "inventory_video_features_inventory_item_id_inventory_items_id_fk" FOREIGN KEY ("inventory_item_id") REFERENCES "public"."inventory_items"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "newsletter_edition_subscriptions" ADD CONSTRAINT "newsletter_edition_subscriptions_subscriber_id_newsletter_subscribers_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."newsletter_subscribers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "newsletter_followed_podcasts" ADD CONSTRAINT "newsletter_followed_podcasts_subscriber_id_newsletter_subscribers_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."newsletter_subscribers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "newsletter_followed_podcasts" ADD CONSTRAINT "newsletter_followed_podcasts_podcast_id_podcasts_id_fk" FOREIGN KEY ("podcast_id") REFERENCES "public"."podcasts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "newsletter_sends" ADD CONSTRAINT "newsletter_sends_issue_id_newsletter_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."newsletter_issues"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "newsletter_sends" ADD CONSTRAINT "newsletter_sends_subscriber_id_newsletter_subscribers_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."newsletter_subscribers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "audience_tags_slug_idx" ON "audience_tags" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "categories_slug_idx" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "hosts_slug_idx" ON "hosts" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "podcast_platform_idx" ON "podcast_platforms" USING btree ("podcast_id","platform");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_follower_idx" ON "podcast_platforms" USING btree ("platform","follower_count");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "podcasts_slug_idx" ON "podcasts" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "podcasts_ownership_idx" ON "podcasts" USING btree ("ownership_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "podcasts_status_idx" ON "podcasts" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "podcasts_geo_idx" ON "podcasts" USING btree ("country_code","state_or_region","city");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "inventory_podcast_idx" ON "inventory_items" USING btree ("podcast_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "inventory_format_idx" ON "inventory_items" USING btree ("creative_format");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "inventory_availability_idx" ON "inventory_items" USING btree ("availability_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "newsletter_sends_issue_idx" ON "newsletter_sends" USING btree ("issue_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "newsletter_subscribers_email_idx" ON "newsletter_subscribers" USING btree ("email");