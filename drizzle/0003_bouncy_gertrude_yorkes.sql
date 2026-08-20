CREATE TABLE IF NOT EXISTS "bio" (
	"id" text PRIMARY KEY DEFAULT 'default' NOT NULL,
	"greeting" text NOT NULL,
	"content" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);