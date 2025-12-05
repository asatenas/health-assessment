ALTER TABLE "Chat" ADD COLUMN "score_rcri" integer;--> statement-breakpoint
ALTER TABLE "Chat" ADD COLUMN "score_aub_has2" integer;--> statement-breakpoint
ALTER TABLE "Chat" ADD CONSTRAINT "score_rcri_non_negative" CHECK ("score_rcri" >= 0);--> statement-breakpoint
ALTER TABLE "Chat" ADD CONSTRAINT "score_aub_has2_non_negative" CHECK ("score_aub_has2" >= 0);
