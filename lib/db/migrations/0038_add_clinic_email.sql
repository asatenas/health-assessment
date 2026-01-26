-- Add email column to Clinic table
ALTER TABLE "Clinic" ADD COLUMN "email" varchar(64);

-- Copy email from owner user to clinic
UPDATE "Clinic" c
SET "email" = u."email"
FROM "User" u
WHERE u."clinicId" = c."id" AND u."role" = 'owner';

-- Make email NOT NULL after copying data
ALTER TABLE "Clinic" ALTER COLUMN "email" SET NOT NULL;

-- Add unique constraint on email
ALTER TABLE "Clinic" ADD CONSTRAINT "Clinic_email_unique" UNIQUE("email");
