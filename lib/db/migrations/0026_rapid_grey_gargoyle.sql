ALTER TABLE "Assessment" ADD COLUMN "nps" integer;--> statement-breakpoint
ALTER TABLE "Assessment" ADD CONSTRAINT "nps_range" CHECK ("nps" >= 0 AND "nps" <= 10);