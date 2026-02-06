ALTER TABLE "Message_v2" DROP CONSTRAINT "Message_v2_chatId_Assessment_id_fk";
--> statement-breakpoint
ALTER TABLE "Stream" DROP CONSTRAINT "Stream_chatId_Assessment_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Message_v2" ADD CONSTRAINT "Message_v2_assessmentId_Assessment_id_fk" FOREIGN KEY ("assessmentId") REFERENCES "public"."Assessment"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Stream" ADD CONSTRAINT "Stream_assessmentId_Assessment_id_fk" FOREIGN KEY ("assessmentId") REFERENCES "public"."Assessment"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
