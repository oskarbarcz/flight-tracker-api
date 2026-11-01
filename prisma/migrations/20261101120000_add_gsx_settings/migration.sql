-- AlterTable
ALTER TABLE "user" ADD COLUMN     "gsxAutoBoardingEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "gsxAutoDeboardingEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "gsxIntegrationEnabled" BOOLEAN NOT NULL DEFAULT false;
