CREATE TABLE IF NOT EXISTS "claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"podcast_slug" text NOT NULL,
	"claim_email" text NOT NULL,
	"role" text,
	"method" text NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"podcast_slug" text NOT NULL,
	"from_email" text NOT NULL,
	"message" text NOT NULL,
	"routed_to" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "claims_podcast_idx" ON "claims" USING btree ("podcast_slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "inquiries_podcast_idx" ON "inquiries" USING btree ("podcast_slug");