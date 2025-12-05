ALTER TABLE "Chat" RENAME TO "Assessment";--> statement-breakpoint
ALTER TABLE "User" RENAME TO "Clinic";--> statement-breakpoint
ALTER TABLE "Assessment" DROP CONSTRAINT "Chat_userId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "Document" DROP CONSTRAINT "Document_userId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "Message_v2" DROP CONSTRAINT "Message_v2_chatId_Chat_id_fk";
--> statement-breakpoint
ALTER TABLE "Message" DROP CONSTRAINT "Message_chatId_Chat_id_fk";
--> statement-breakpoint
ALTER TABLE "Stream" DROP CONSTRAINT "Stream_chatId_Chat_id_fk";
--> statement-breakpoint
ALTER TABLE "Suggestion" DROP CONSTRAINT "Suggestion_userId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "Vote_v2" DROP CONSTRAINT "Vote_v2_chatId_Chat_id_fk";
--> statement-breakpoint
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_chatId_Chat_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_userId_Clinic_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."Clinic"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_Clinic_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."Clinic"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Message_v2" ADD CONSTRAINT "Message_v2_chatId_Assessment_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."Assessment"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Message" ADD CONSTRAINT "Message_chatId_Assessment_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."Assessment"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Stream" ADD CONSTRAINT "Stream_chatId_Assessment_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."Assessment"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Suggestion" ADD CONSTRAINT "Suggestion_userId_Clinic_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."Clinic"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Vote_v2" ADD CONSTRAINT "Vote_v2_chatId_Assessment_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."Assessment"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Vote" ADD CONSTRAINT "Vote_chatId_Assessment_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."Assessment"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
