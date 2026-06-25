-- CreateEnum
CREATE TYPE "aircraft_reposition_type" AS ENUM ('performing_flight', 'dead_head_manual', 'dead_head_automatic');

-- CreateEnum
CREATE TYPE "aircraft_reposition_status" AS ENUM ('pending', 'finished');

-- CreateTable
CREATE TABLE "aircraft_reposition" (
    "id" UUID NOT NULL,
    "aircraftId" UUID NOT NULL,
    "type" "aircraft_reposition_type" NOT NULL,
    "status" "aircraft_reposition_status" NOT NULL,
    "departureAirportId" UUID NOT NULL,
    "destinationAirportId" UUID NOT NULL,
    "distance" INTEGER NOT NULL,
    "flightId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "aircraft_reposition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "aircraft_reposition_aircraftId_idx" ON "aircraft_reposition"("aircraftId");

-- AddForeignKey
ALTER TABLE "aircraft_reposition" ADD CONSTRAINT "aircraft_reposition_aircraftId_fkey" FOREIGN KEY ("aircraftId") REFERENCES "aircraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aircraft_reposition" ADD CONSTRAINT "aircraft_reposition_departureAirportId_fkey" FOREIGN KEY ("departureAirportId") REFERENCES "airport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aircraft_reposition" ADD CONSTRAINT "aircraft_reposition_destinationAirportId_fkey" FOREIGN KEY ("destinationAirportId") REFERENCES "airport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aircraft_reposition" ADD CONSTRAINT "aircraft_reposition_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "flight"("id") ON DELETE SET NULL ON UPDATE CASCADE;
