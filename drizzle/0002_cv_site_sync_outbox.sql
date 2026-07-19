CREATE TABLE IF NOT EXISTS "cv_site_sync_outbox" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"action" text NOT NULL,
	"project_id" text NOT NULL,
	"project" jsonb,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Cv_site_sync_outbox_project_idx" ON "cv_site_sync_outbox" USING btree ("project_id");
