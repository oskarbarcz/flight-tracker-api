-- AlterTable
ALTER TABLE "user" ADD COLUMN     "discordPreliminaryLoadsheetEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "discordFinalLoadsheetEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "discordDelayAllocationEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "discordDelayApprovalEnabled" BOOLEAN NOT NULL DEFAULT true;
