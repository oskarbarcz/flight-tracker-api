-- AlterTable
ALTER TABLE "flight"
    ADD COLUMN "arrivalGateId"   UUID,
    ADD COLUMN "arrivalRunwayId" UUID;

-- AddForeignKey
ALTER TABLE "flight" ADD CONSTRAINT "flight_arrivalGateId_fkey" FOREIGN KEY ("arrivalGateId") REFERENCES "gate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flight" ADD CONSTRAINT "flight_arrivalRunwayId_fkey" FOREIGN KEY ("arrivalRunwayId") REFERENCES "runway"("id") ON DELETE SET NULL ON UPDATE CASCADE;
