CREATE TABLE "ClinicInvitation" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" VARCHAR(64) NOT NULL,
  "clinicId" UUID NOT NULL REFERENCES "Clinic"("id") ON DELETE CASCADE,
  "role" VARCHAR NOT NULL CHECK ("role" IN ('secretary', 'clinician', 'admin', 'owner')),
  "invitedBy" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "expiresAt" TIMESTAMP NOT NULL,
  UNIQUE("email", "clinicId")
);

CREATE INDEX "idx_clinic_invitation_email" ON "ClinicInvitation"("email");
CREATE INDEX "idx_clinic_invitation_clinic" ON "ClinicInvitation"("clinicId");
