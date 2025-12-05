-- Update ChatWithStatus view to reference the renamed Assessment table
-- The view was created before we renamed Chat to Assessment
DROP VIEW IF EXISTS "ChatWithStatus";--> statement-breakpoint

CREATE OR REPLACE VIEW "ChatWithStatus" AS
SELECT
  *,
  CASE
    WHEN "tokenExpiresAt" <= now() THEN 'expired'
    ELSE "status"
  END AS "computed_status"
FROM "Assessment";
