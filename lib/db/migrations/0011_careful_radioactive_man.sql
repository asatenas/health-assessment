ALTER TABLE "Chat" ADD COLUMN "token" varchar(64);--> statement-breakpoint
ALTER TABLE "Chat" ADD COLUMN "status" varchar DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "emailVerified" boolean DEFAULT false NOT NULL;