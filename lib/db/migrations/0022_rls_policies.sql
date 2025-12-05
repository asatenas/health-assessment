-- Enable Row Level Security on Patient table only
-- Note: Assessment table uses token-based access (patients don't login),
-- so RLS is not appropriate there. Access control is via token + tokenExpiresAt.
ALTER TABLE "Patient" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "clinic_patient_isolation" ON "Patient";--> statement-breakpoint

-- Policy: Clinics can only see their own patients
-- This requires setting app.current_clinic_id session variable before queries
-- Use setClinicContext() from lib/db/rls-helper.ts before querying patients
CREATE POLICY "clinic_patient_isolation" ON "Patient"
  AS RESTRICTIVE
  FOR ALL
  USING ("clinicId" = current_setting('app.current_clinic_id', true)::uuid);
