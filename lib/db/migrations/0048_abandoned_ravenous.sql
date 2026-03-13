CREATE TABLE IF NOT EXISTS "EarlyAccessSignups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"variant" varchar(10) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
