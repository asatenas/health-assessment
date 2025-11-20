ALTER TABLE "Chat" ALTER COLUMN "token" SET DATA TYPE varchar(9);--> statement-breakpoint
ALTER TABLE "Chat" ADD COLUMN "tokenExpiresAt" timestamp;