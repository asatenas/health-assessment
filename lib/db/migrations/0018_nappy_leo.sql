CREATE TABLE IF NOT EXISTS "Patient" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cpf" varchar(14) NOT NULL,
	"phoneNumber" varchar(20),
	"email" varchar(255),
	CONSTRAINT "Patient_cpf_unique" UNIQUE("cpf")
);
