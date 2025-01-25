-- AlterTable
ALTER TABLE "airport"
    ADD COLUMN "city" TEXT NOT NULL,
    ADD COLUMN "iataCode" VARCHAR(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "airport_iataCode_key" ON "airport"("iataCode");
