-- Create Surgery table for tracking surgery outcomes and follow-up
CREATE TABLE IF NOT EXISTS "Surgery" (
	"assessmentId" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"date" timestamp,
	"completed" boolean DEFAULT false NOT NULL,
	"rescheduled" boolean DEFAULT false NOT NULL,
	"cancelled" boolean DEFAULT false NOT NULL,
	"statusReason" varchar(200),
	"medicalInterventionRequired" boolean DEFAULT false NOT NULL,
	"interventionNotes" text,
	"adjustmentsRequired" boolean DEFAULT false NOT NULL,
	"adjustmentNotes" text
);

-- Add foreign key constraint
ALTER TABLE "Surgery" ADD CONSTRAINT "Surgery_assessmentId_Assessment_id_fk" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE cascade ON UPDATE no action;
