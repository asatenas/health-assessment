-- Add columns from ClinicConfig to Clinic table
ALTER TABLE "Clinic" ADD COLUMN "clinicName" varchar(255);
ALTER TABLE "Clinic" ADD COLUMN "formConfig" json;
ALTER TABLE "Clinic" ADD COLUMN "dashboardConfig" json;
ALTER TABLE "Clinic" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;

-- Migrate data from ClinicConfig to Clinic
UPDATE "Clinic" c
SET
  "clinicName" = cc."clinicName",
  "formConfig" = cc."formConfig",
  "dashboardConfig" = cc."dashboardConfig",
  "updatedAt" = cc."updatedAt"
FROM "ClinicConfig" cc
WHERE c."id" = cc."clinicId";

-- Drop the ClinicConfig table
DROP TABLE "ClinicConfig";
