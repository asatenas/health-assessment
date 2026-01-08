CREATE TABLE IF NOT EXISTS "ClinicConfig" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinicId" uuid NOT NULL,
	"clinicName" varchar(255),
	"formConfig" json NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ClinicConfig_clinicId_unique" UNIQUE("clinicId")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ClinicConfig" ADD CONSTRAINT "ClinicConfig_clinicId_Clinic_id_fk" FOREIGN KEY ("clinicId") REFERENCES "public"."Clinic"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
INSERT INTO "ClinicConfig" ("clinicId", "formConfig")
SELECT "id", '{"version":1,"sections":{"basicInfo":{"enabled":true,"fields":{"idade":{"enabled":true},"peso":{"enabled":true},"altura":{"enabled":true}}},"healthProblems":{"enabled":false,"fields":{"cardiologicos":{"enabled":false},"respiratorios":{"enabled":false},"renais":{"enabled":false},"figado":{"enabled":false},"vasculares":{"enabled":false}}},"allergies":{"enabled":true,"fields":{"alergiaLatex":{"enabled":true},"alergias":{"enabled":true}}},"medicalDevices":{"enabled":true,"fields":{"marcaPasso":{"enabled":true},"cdi":{"enabled":true},"bombaMedicamentos":{"enabled":true},"dispositivosOutros":{"enabled":true}}},"aestheticItems":{"enabled":true,"fields":{"megaHair":{"enabled":true},"apliques":{"enabled":true},"unhaGel":{"enabled":true},"ciliosPosticos":{"enabled":true},"piercings":{"enabled":true},"lenteContato":{"enabled":true},"itensUsoOutros":{"enabled":true}}},"habitsAndVices":{"enabled":true,"fields":{"cocaina":{"enabled":true},"maconha":{"enabled":true},"crack":{"enabled":true},"opiaceos":{"enabled":true},"metanfetamina":{"enabled":true},"alcool":{"enabled":true},"drogasRecreativasOutros":{"enabled":true}}},"exams":{"enabled":true,"fields":{"hemoglobina":{"enabled":true},"creatinina":{"enabled":true}}}}}'::json
FROM "Clinic"
WHERE NOT EXISTS (SELECT 1 FROM "ClinicConfig" WHERE "clinicId" = "Clinic"."id");
