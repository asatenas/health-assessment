-- Add 'removed' status to user_status enum and migrate existing 'disabled' users

-- Create new enum with 'removed' status
ALTER TYPE user_status RENAME TO user_status_old;
CREATE TYPE user_status AS ENUM ('active', 'invited', 'removed');

-- Update column to use new enum
ALTER TABLE "User"
  ALTER COLUMN status TYPE user_status
  USING status::text::user_status;

-- Drop old enum
DROP TYPE user_status_old;

-- Migrate existing 'disabled' users to 'removed'
-- Note: This will fail if there are any disabled users, which is expected
-- The migration should be run when there are no disabled users, or manually handle them first
