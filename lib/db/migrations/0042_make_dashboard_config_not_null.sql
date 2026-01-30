-- Populate NULL dashboardConfig with default configuration
UPDATE "Clinic"
SET "dashboardConfig" = '{
  "widgets": {
    "metricsOverview": {"enabled": true, "position": 1},
    "riskDistribution": {"enabled": true, "position": 2},
    "timeline": {"enabled": true, "position": 3},
    "todaysSurgeries": {"enabled": true, "position": 4},
    "weeklySurgeries": {"enabled": true, "position": 5},
    "monthlySurgeries": {"enabled": true, "position": 6},
    "cancellations": {"enabled": false, "position": 7},
    "notifications": {"enabled": true, "position": 8}
  }
}'::json
WHERE "dashboardConfig" IS NULL;

-- Make dashboardConfig NOT NULL with default value
ALTER TABLE "Clinic" ALTER COLUMN "dashboardConfig" SET NOT NULL;
ALTER TABLE "Clinic" ALTER COLUMN "dashboardConfig" SET DEFAULT '{
  "widgets": {
    "metricsOverview": {"enabled": true, "position": 1},
    "riskDistribution": {"enabled": true, "position": 2},
    "timeline": {"enabled": true, "position": 3},
    "todaysSurgeries": {"enabled": true, "position": 4},
    "weeklySurgeries": {"enabled": true, "position": 5},
    "monthlySurgeries": {"enabled": true, "position": 6},
    "cancellations": {"enabled": false, "position": 7},
    "notifications": {"enabled": true, "position": 8}
  }
}'::json;
