ALTER TABLE "Checkpoint" RENAME COLUMN "anemia" TO "hemoglobin";--> statement-breakpoint
ALTER TABLE "Checkpoint" DROP COLUMN IF EXISTS "formOpened";--> statement-breakpoint
ALTER TABLE "Checkpoint" ADD COLUMN "cerebralIschemia" timestamp;--> statement-breakpoint
ALTER TABLE "Checkpoint" ADD COLUMN "coronaryDisease" timestamp;--> statement-breakpoint
ALTER TABLE "Checkpoint" ADD COLUMN "cardiacStructure" timestamp;
