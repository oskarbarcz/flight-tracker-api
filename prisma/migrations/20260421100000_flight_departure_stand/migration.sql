-- AlterTable
ALTER TABLE "flight"
    ADD COLUMN "departureGateId"   UUID,
    ADD COLUMN "departureRunwayId" UUID;

-- AddForeignKey
ALTER TABLE "flight" ADD CONSTRAINT "flight_departureGateId_fkey" FOREIGN KEY ("departureGateId") REFERENCES "gate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flight" ADD CONSTRAINT "flight_departureRunwayId_fkey" FOREIGN KEY ("departureRunwayId") REFERENCES "runway"("id") ON DELETE SET NULL ON UPDATE CASCADE;
