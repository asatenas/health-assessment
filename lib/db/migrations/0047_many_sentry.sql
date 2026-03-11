CREATE TABLE IF NOT EXISTS "SurgeryLocation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinicId" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Surgery" ADD COLUMN "locationId" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "SurgeryLocation" ADD CONSTRAINT "SurgeryLocation_clinicId_Clinic_id_fk" FOREIGN KEY ("clinicId") REFERENCES "public"."Clinic"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Surgery" ADD CONSTRAINT "Surgery_locationId_SurgeryLocation_id_fk" FOREIGN KEY ("locationId") REFERENCES "public"."SurgeryLocation"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
