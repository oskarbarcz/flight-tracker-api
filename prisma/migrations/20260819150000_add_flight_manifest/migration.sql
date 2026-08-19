-- CreateEnum
CREATE TYPE "FlightPassengerStatus" AS ENUM ('boarded', 'no_show');

-- AlterTable
ALTER TABLE "flight" ADD COLUMN     "cabinLayout" TEXT,
ADD COLUMN     "cabinLayoutRevision" INTEGER;

-- CreateTable
CREATE TABLE "flight_passenger" (
    "id" UUID NOT NULL,
    "flightId" UUID NOT NULL,
    "designator" TEXT NOT NULL,
    "deck" "CabinDeck" NOT NULL,
    "cabin" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pnr" VARCHAR(6) NOT NULL,
    "status" "FlightPassengerStatus" NOT NULL DEFAULT 'boarded',
    "ssr" TEXT,

    CONSTRAINT "flight_passenger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "flight_passenger_flightId_idx" ON "flight_passenger"("flightId");

-- CreateIndex
CREATE UNIQUE INDEX "flight_passenger_flightId_designator_key" ON "flight_passenger"("flightId", "designator");

-- CreateIndex
CREATE INDEX "flight_cabinLayout_cabinLayoutRevision_idx" ON "flight"("cabinLayout", "cabinLayoutRevision");

-- AddForeignKey
ALTER TABLE "flight" ADD CONSTRAINT "flight_cabinLayout_cabinLayoutRevision_fkey" FOREIGN KEY ("cabinLayout", "cabinLayoutRevision") REFERENCES "cabin_layout_version"("layoutId", "revision") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flight_passenger" ADD CONSTRAINT "flight_passenger_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "flight"("id") ON DELETE CASCADE ON UPDATE CASCADE;
