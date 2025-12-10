ALTER TABLE "Message_v2" RENAME COLUMN "chatId" TO "assessmentId";--> statement-breakpoint
ALTER TABLE "Vote_v2" RENAME COLUMN "chatId" TO "assessmentId";--> statement-breakpoint
ALTER TABLE "Stream" RENAME COLUMN "chatId" TO "assessmentId";
