-- AlterTable
ALTER TABLE "flight" ADD COLUMN "createdById" UUID;

-- AddForeignKey
ALTER TABLE "flight" ADD CONSTRAINT "flight_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "flight_captainId_createdAt_idx" ON "flight"("captainId", "createdAt");

-- CreateIndex
CREATE INDEX "flight_createdById_createdAt_idx" ON "flight"("createdById", "createdAt");

-- Backfill the creator from the recorded flight creation event
UPDATE "flight" f
SET "createdById" = fe."actorId"
FROM "flight_event" fe
WHERE fe."flightId" = f.id
  AND fe.type = 'flight.created'
  AND fe."actorId" IS NOT NULL;
