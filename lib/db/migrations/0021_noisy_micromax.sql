ALTER TABLE "Patient" DROP CONSTRAINT "Patient_cpf_unique";--> statement-breakpoint
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_clinicId_cpf_unique" UNIQUE("clinicId","cpf");