ALTER TABLE "User" ADD COLUMN "name" varchar(200);--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "phoneNumber" varchar(20);--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "profilePhotoUrl" text;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "referralSource" text;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "foundersConsent" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "onboardingCompleted" boolean DEFAULT false;
