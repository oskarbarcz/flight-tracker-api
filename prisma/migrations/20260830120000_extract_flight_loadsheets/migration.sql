-- CreateEnum
CREATE TYPE "LoadsheetKind" AS ENUM ('preliminary', 'final');

-- CreateTable
CREATE TABLE "flight_loadsheet" (
    "id" UUID NOT NULL,
    "flightId" UUID NOT NULL,
    "kind" "LoadsheetKind" NOT NULL,
    "revision" INTEGER NOT NULL,
    "pilots" INTEGER NOT NULL,
    "reliefPilots" INTEGER NOT NULL,
    "cabinCrew" INTEGER NOT NULL,
    "passengers" INTEGER NOT NULL,
    "firstPassengers" INTEGER,
    "businessPassengers" INTEGER,
    "premiumEconomyPassengers" INTEGER,
    "economyPassengers" INTEGER,
    "passengerMass" DECIMAL(4,1),
    "cargo" DECIMAL(7,3) NOT NULL,
    "payload" DECIMAL(7,3) NOT NULL,
    "zeroFuelWeight" DECIMAL(7,3) NOT NULL,
    "blockFuel" DECIMAL(7,3) NOT NULL,
    "fuelBlock" DECIMAL(7,3),
    "fuelTaxi" DECIMAL(7,3),
    "fuelTrip" DECIMAL(7,3),
    "fuelAlternate" DECIMAL(7,3),
    "fuelReserve" DECIMAL(7,3),
    "fuelContingencyType" VARCHAR(64),
    "fuelContingencyAmount" DECIMAL(7,3),
    "fuelMel" DECIMAL(7,3),
    "fuelAtc" DECIMAL(7,3),
    "fuelWxx" DECIMAL(7,3),
    "fuelExtra" DECIMAL(7,3),
    "fuelTankering" DECIMAL(7,3),
    "fuelEtops" DECIMAL(7,3),
    "fuelMinTakeoff" DECIMAL(7,3),
    "fuelPlanTakeoff" DECIMAL(7,3),
    "fuelPlanLanding" DECIMAL(7,3),
    "fuelAverageFlow" DECIMAL(7,3),
    "fuelMaxTanks" DECIMAL(7,3),
    "issuedById" UUID,
    "issuedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flight_loadsheet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "flight_loadsheet_flightId_idx" ON "flight_loadsheet"("flightId");

-- CreateIndex
CREATE UNIQUE INDEX "flight_loadsheet_flightId_kind_revision_key" ON "flight_loadsheet"("flightId", "kind", "revision");

-- AddForeignKey
ALTER TABLE "flight_loadsheet" ADD CONSTRAINT "flight_loadsheet_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "flight"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flight_loadsheet" ADD CONSTRAINT "flight_loadsheet_issuedById_fkey" FOREIGN KEY ("issuedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
