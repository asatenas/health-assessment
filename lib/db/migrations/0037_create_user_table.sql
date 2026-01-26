-- Create User table
CREATE TABLE IF NOT EXISTS "User" (
	"id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
	"clinicId" uuid NOT NULL,
	"email" varchar(64) NOT NULL,
	"password" varchar(64),
	"emailVerified" boolean DEFAULT false NOT NULL,
	"role" varchar(20) NOT NULL,
	"status" varchar(20) NOT NULL
);

-- Add foreign key constraint
ALTER TABLE "User" ADD CONSTRAINT "User_clinicId_Clinic_id_fk"
	FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE cascade ON UPDATE no action;

-- Add unique constraint on email per clinic
ALTER TABLE "User" ADD CONSTRAINT "User_clinicId_email_unique" UNIQUE("clinicId", "email");

-- Migrate data from Clinic to User (existing clinic accounts become owner users)
INSERT INTO "User" ("clinicId", "email", "password", "emailVerified", "role", "status")
SELECT "id", "email", "password", "emailVerified", 'owner', 'active'
FROM "Clinic";

-- Add authorized column to Clinic
ALTER TABLE "Clinic" ADD COLUMN "authorized" boolean DEFAULT false NOT NULL;

-- Copy emailVerified to authorized
UPDATE "Clinic" SET "authorized" = "emailVerified";

-- Drop columns from Clinic that are now in User table
ALTER TABLE "Clinic" DROP COLUMN "email";
ALTER TABLE "Clinic" DROP COLUMN "password";
ALTER TABLE "Clinic" DROP COLUMN "emailVerified";
