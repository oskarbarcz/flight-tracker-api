-- An ETOPS flight records where it may divert and when. The points the plan computes are kept
-- with their own positions so the briefing can be drawn on a map; the airports each point turns
-- toward are recorded as an association only. No fuel figure is stored: the flight management
-- system computes fuel on board and fuel to a diversion continuously, and more currently than a
-- snapshot taken at planning time.

-- CreateEnum
CREATE TYPE "EtopsPointKind" AS ENUM ('entry', 'exit', 'equal_time', 'critical');

-- AlterTable
ALTER TABLE "flight" ADD COLUMN "etopsRuleMinutes" INTEGER;
ALTER TABLE "flight" ADD COLUMN "etopsRuleDistanceNm" DECIMAL(8,2);
ALTER TABLE "flight" ADD COLUMN "etopsThresholdMinutes" INTEGER;

-- CreateTable
CREATE TABLE "flight_etops_point" (
    "id" UUID NOT NULL,
    "flightId" UUID NOT NULL,
    "kind" "EtopsPointKind" NOT NULL,
    "ordinal" INTEGER NOT NULL DEFAULT 1,
    "isCritical" BOOLEAN NOT NULL DEFAULT false,
    "adequateAirportId" UUID,
    "posLat" DECIMAL(9,6) NOT NULL,
    "posLong" DECIMAL(9,6) NOT NULL,
    "elapsedSeconds" INTEGER NOT NULL,
    "condition" TEXT,

    CONSTRAINT "flight_etops_point_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "flight_etops_point_flightId_kind_ordinal_key" ON "flight_etops_point"("flightId", "kind", "ordinal");

-- CreateTable
CREATE TABLE "flight_etops_diversion_airport" (
    "id" UUID NOT NULL,
    "pointId" UUID NOT NULL,
    "airportId" UUID NOT NULL,
    "ordinal" INTEGER NOT NULL,

    CONSTRAINT "flight_etops_diversion_airport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "flight_etops_diversion_airport_pointId_ordinal_key" ON "flight_etops_diversion_airport"("pointId", "ordinal");

-- CreateTable
CREATE TABLE "flight_etops_airport" (
    "id" UUID NOT NULL,
    "flightId" UUID NOT NULL,
    "airportId" UUID NOT NULL,
    "suitabilityStart" TIMESTAMP(3) NOT NULL,
    "suitabilityEnd" TIMESTAMP(3) NOT NULL,
    "plannedRunway" TEXT,
    "forecastCeiling" INTEGER,
    "forecastVisibility" INTEGER,
    "transitionAltitude" INTEGER,
    "transitionLevel" INTEGER,

    CONSTRAINT "flight_etops_airport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "flight_etops_airport_flightId_airportId_key" ON "flight_etops_airport"("flightId", "airportId");

-- AddForeignKey
ALTER TABLE "flight_etops_point" ADD CONSTRAINT "flight_etops_point_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "flight"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "flight_etops_point" ADD CONSTRAINT "flight_etops_point_adequateAirportId_fkey" FOREIGN KEY ("adequateAirportId") REFERENCES "airport"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "flight_etops_diversion_airport" ADD CONSTRAINT "flight_etops_diversion_airport_pointId_fkey" FOREIGN KEY ("pointId") REFERENCES "flight_etops_point"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "flight_etops_diversion_airport" ADD CONSTRAINT "flight_etops_diversion_airport_airportId_fkey" FOREIGN KEY ("airportId") REFERENCES "airport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "flight_etops_airport" ADD CONSTRAINT "flight_etops_airport_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "flight"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "flight_etops_airport" ADD CONSTRAINT "flight_etops_airport_airportId_fkey" FOREIGN KEY ("airportId") REFERENCES "airport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
