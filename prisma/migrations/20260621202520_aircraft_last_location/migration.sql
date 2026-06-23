-- CreateEnum
CREATE TYPE "AircraftState" AS ENUM ('idle', 'planned', 'checked_in', 'cruise');

-- DropForeignKey
ALTER TABLE "delay_report" DROP CONSTRAINT "delay_report_decidedById_fkey";

-- DropForeignKey
ALTER TABLE "flight_emergency" DROP CONSTRAINT "flight_emergency_resolvedBy_fkey";

-- AlterTable
ALTER TABLE "aircraft"
ADD COLUMN  "baseAirportId"        UUID,
ADD COLUMN  "lastAirportId"        UUID,
ADD COLUMN  "lastAirportUpdatedAt" TIMESTAMP(3),
ADD COLUMN  "currentState"         "AircraftState" NOT NULL DEFAULT 'idle';

-- AddForeignKey
ALTER TABLE "aircraft" ADD CONSTRAINT "aircraft_baseAirportId_fkey" FOREIGN KEY ("baseAirportId") REFERENCES "airport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aircraft" ADD CONSTRAINT "aircraft_lastAirportId_fkey" FOREIGN KEY ("lastAirportId") REFERENCES "airport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flight_emergency" ADD CONSTRAINT "flight_emergency_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delay_report" ADD CONSTRAINT "delay_report_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
