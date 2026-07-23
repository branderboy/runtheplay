CREATE TYPE "public"."boost_scope" AS ENUM('directory', 'planner_results', 'newsletter', 'all');--> statement-breakpoint
CREATE TYPE "public"."boost_status" AS ENUM('scheduled', 'active', 'paused', 'expired', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."campaign_goal" AS ENUM('brand_awareness', 'product_launch', 'music_release', 'event_promotion', 'local_business', 'lead_generation', 'community_nonprofit', 'recruiting', 'other');--> statement-breakpoint
CREATE TYPE "public"."plan_status" AS ENUM('draft', 'active', 'archived');--> statement-breakpoint
CREATE TYPE "public"."price_basis" AS ENUM('listed', 'starting', 'user_estimate', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."subscription_product" AS ENUM('boost_directory', 'boost_planner_results', 'boost_newsletter', 'boost_all');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('trialing', 'active', 'past_due', 'canceled', 'unpaid');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "basket_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"basket_id" uuid NOT NULL,
	"podcast_id" uuid NOT NULL,
	"inventory_item_id" uuid,
	"quantity" integer DEFAULT 1,
	"price_basis" "price_basis" DEFAULT 'unknown' NOT NULL,
	"planned_unit_price" numeric,
	"notes" text,
	"display_order" integer DEFAULT 0,
	"match_score" numeric,
	"match_reasons" jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "campaign_baskets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_plan_id" uuid NOT NULL,
	"share_token_hash" text,
	"sharing_enabled" boolean DEFAULT false,
	"show_notes_on_share" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "campaign_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"name" text,
	"organization_name" text,
	"goal" "campaign_goal" NOT NULL,
	"message_summary" text,
	"budget_min" numeric,
	"budget_max" numeric,
	"currency" text DEFAULT 'USD',
	"start_date" date,
	"end_date" date,
	"media_type" "media_type",
	"geography_json" jsonb,
	"audience_json" jsonb,
	"format_preferences_json" jsonb,
	"status" "plan_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "recommendation_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recommendation_run_id" uuid NOT NULL,
	"podcast_id" uuid NOT NULL,
	"inventory_item_id" uuid,
	"score" numeric NOT NULL,
	"reasons" jsonb,
	"rank" integer NOT NULL,
	"is_sponsored" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "recommendation_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_plan_id" uuid NOT NULL,
	"algorithm_version" text NOT NULL,
	"input_snapshot" jsonb,
	"generated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "listing_boosts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"podcast_id" uuid NOT NULL,
	"scope" "boost_scope" NOT NULL,
	"status" "boost_status" DEFAULT 'scheduled' NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"subscription_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"podcast_id" uuid NOT NULL,
	"product" "subscription_product" NOT NULL,
	"status" "subscription_status" DEFAULT 'trialing' NOT NULL,
	"provider_customer_id" text,
	"provider_subscription_id" text,
	"current_period_end" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "basket_items" ADD CONSTRAINT "basket_items_basket_id_campaign_baskets_id_fk" FOREIGN KEY ("basket_id") REFERENCES "public"."campaign_baskets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "basket_items" ADD CONSTRAINT "basket_items_podcast_id_podcasts_id_fk" FOREIGN KEY ("podcast_id") REFERENCES "public"."podcasts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "basket_items" ADD CONSTRAINT "basket_items_inventory_item_id_inventory_items_id_fk" FOREIGN KEY ("inventory_item_id") REFERENCES "public"."inventory_items"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "campaign_baskets" ADD CONSTRAINT "campaign_baskets_campaign_plan_id_campaign_plans_id_fk" FOREIGN KEY ("campaign_plan_id") REFERENCES "public"."campaign_plans"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "recommendation_results" ADD CONSTRAINT "recommendation_results_recommendation_run_id_recommendation_runs_id_fk" FOREIGN KEY ("recommendation_run_id") REFERENCES "public"."recommendation_runs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "recommendation_results" ADD CONSTRAINT "recommendation_results_podcast_id_podcasts_id_fk" FOREIGN KEY ("podcast_id") REFERENCES "public"."podcasts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "recommendation_results" ADD CONSTRAINT "recommendation_results_inventory_item_id_inventory_items_id_fk" FOREIGN KEY ("inventory_item_id") REFERENCES "public"."inventory_items"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "recommendation_runs" ADD CONSTRAINT "recommendation_runs_campaign_plan_id_campaign_plans_id_fk" FOREIGN KEY ("campaign_plan_id") REFERENCES "public"."campaign_plans"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "listing_boosts" ADD CONSTRAINT "listing_boosts_podcast_id_podcasts_id_fk" FOREIGN KEY ("podcast_id") REFERENCES "public"."podcasts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "listing_boosts" ADD CONSTRAINT "listing_boosts_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_podcast_id_podcasts_id_fk" FOREIGN KEY ("podcast_id") REFERENCES "public"."podcasts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "basket_items_basket_idx" ON "basket_items" USING btree ("basket_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "basket_items_unique_idx" ON "basket_items" USING btree ("basket_id","podcast_id","inventory_item_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "campaign_baskets_plan_idx" ON "campaign_baskets" USING btree ("campaign_plan_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "campaign_plans_user_idx" ON "campaign_plans" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "recommendation_results_run_idx" ON "recommendation_results" USING btree ("recommendation_run_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "listing_boosts_podcast_idx" ON "listing_boosts" USING btree ("podcast_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "listing_boosts_active_idx" ON "listing_boosts" USING btree ("scope","status","ends_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "subscriptions_podcast_idx" ON "subscriptions" USING btree ("podcast_id");