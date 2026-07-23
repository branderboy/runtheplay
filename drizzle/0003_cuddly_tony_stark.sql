CREATE TABLE IF NOT EXISTS "listing_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"show_name" text NOT NULL,
	"contact_name" text,
	"email" text NOT NULL,
	"show_url" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "listing_requests_email_idx" ON "listing_requests" USING btree ("email");