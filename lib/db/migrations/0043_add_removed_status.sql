-- Create new enum with 'removed' status
CREATE TYPE user_status AS ENUM ('active', 'invited', 'removed');

-- Update column to use new enum
ALTER TABLE "User"
  ALTER COLUMN status TYPE user_status
  USING status::text::user_status;

-- Note: This will fail if there are any disabled users, which is expected
-- The migration should be run when there are no disabled users, or manually handle them first
