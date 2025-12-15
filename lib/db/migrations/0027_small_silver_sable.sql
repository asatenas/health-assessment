CREATE TABLE IF NOT EXISTS "Checkpoint" (
	"assessmentId" uuid PRIMARY KEY NOT NULL,
	"created" timestamp,
	"opened" timestamp,
	"formOpened" timestamp,
	"formSubmitted" timestamp,
	"medications" timestamp,
	"surgeryType" timestamp,
	"insulin" timestamp,
	"creatinine" timestamp,
	"anemia" timestamp,
	"nps" timestamp,
	"completed" timestamp,
	"interrupted" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Checkpoint" ADD CONSTRAINT "Checkpoint_assessmentId_Assessment_id_fk" FOREIGN KEY ("assessmentId") REFERENCES "public"."Assessment"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
INSERT INTO "Checkpoint" ("assessmentId", "created", "completed")
SELECT "id", "createdAt", "completedAt"
FROM "Assessment";
--> statement-breakpoint
DROP VIEW IF EXISTS "ChatWithStatus";
--> statement-breakpoint
ALTER TABLE "Assessment" DROP COLUMN IF EXISTS "completedAt";