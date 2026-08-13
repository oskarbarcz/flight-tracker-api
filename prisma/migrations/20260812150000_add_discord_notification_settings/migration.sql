-- AlterTable
ALTER TABLE "user" ADD COLUMN     "discordPreliminaryLoadsheetEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "discordFinalLoadsheetEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "discordDelayUpdatesEnabled" BOOLEAN NOT NULL DEFAULT true;
