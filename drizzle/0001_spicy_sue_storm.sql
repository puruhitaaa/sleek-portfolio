ALTER TABLE "posts" ADD COLUMN "is_pinned" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "is_pinned" boolean DEFAULT false;