ALTER TABLE "Patient" ADD COLUMN "clinicId" uuid NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Patient" ADD CONSTRAINT "Patient_clinicId_Clinic_id_fk" FOREIGN KEY ("clinicId") REFERENCES "public"."Clinic"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
