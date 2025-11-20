-- Add a read-only view that exposes a computed_status column.
-- computed_status is 'expired' when tokenExpiresAt <= now(), otherwise the original status.
CREATE OR REPLACE VIEW "ChatWithStatus" AS
SELECT
  *,
  CASE
    WHEN "tokenExpiresAt" <= now() THEN 'expired'
    ELSE "status"
  END AS "computed_status"
FROM "Chat";
