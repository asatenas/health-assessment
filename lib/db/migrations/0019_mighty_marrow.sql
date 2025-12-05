ALTER TABLE "Assessment" ADD COLUMN "patientId" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_patientId_Patient_id_fk" FOREIGN KEY ("patientId") REFERENCES "public"."Patient"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
