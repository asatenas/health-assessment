-- Add platformAdmin column to User table
ALTER TABLE "User" ADD COLUMN "platformAdmin" boolean DEFAULT false NOT NULL;

-- Add CHECK constraint: platformAdmin users must have @asatenas.com.br email
ALTER TABLE "User" ADD CONSTRAINT "User_platformAdmin_email_check"
  CHECK (
    "platformAdmin" = false OR
    "email" LIKE '%@asatenas.com.br'
  );
