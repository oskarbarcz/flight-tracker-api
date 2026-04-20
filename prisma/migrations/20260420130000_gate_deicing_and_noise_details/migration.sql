-- AlterTable
ALTER TABLE "gate"
    ADD COLUMN "deicingDescription" TEXT,
    ADD COLUMN "noiseSensitivityText" TEXT,
    ADD COLUMN "noiseSensitivityStartTime" VARCHAR(5),
    ADD COLUMN "noiseSensitivityEndTime" VARCHAR(5);
