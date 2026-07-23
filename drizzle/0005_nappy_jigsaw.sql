CREATE TABLE IF NOT EXISTS "creator_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"podcast_slug" text NOT NULL,
	"show_name" text,
	"contact_email" text,
	"thumbnail_url" text,
	"description" text,
	"inventory_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"source" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "support_tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"topic" text,
	"message" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "creator_profiles_slug_idx" ON "creator_profiles" USING btree ("podcast_slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "support_tickets_status_idx" ON "support_tickets" USING btree ("status");