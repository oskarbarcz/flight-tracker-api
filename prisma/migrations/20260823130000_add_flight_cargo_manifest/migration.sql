-- CreateEnum
CREATE TYPE "CargoDeck" AS ENUM ('main', 'lower');

-- CreateEnum
CREATE TYPE "CargoUnitKind" AS ENUM ('uld', 'bulk_lot');

-- CreateEnum
CREATE TYPE "CargoContentClass" AS ENUM ('cargo', 'baggage', 'mail');

-- CreateEnum
CREATE TYPE "CargoShipmentStatus" AS ENUM ('loaded', 'offloaded');

-- CreateTable
CREATE TABLE "flight_cargo_unit" (
    "id" UUID NOT NULL,
    "flightId" UUID NOT NULL,
    "kind" "CargoUnitKind" NOT NULL,
    "deck" "CargoDeck",
    "compartment" INTEGER,
    "positionDesignator" VARCHAR(8),
    "uldType" VARCHAR(3),
    "uldSerial" VARCHAR(5),
    "uldOwner" VARCHAR(2),
    "tareKg" INTEGER NOT NULL,
    "grossKg" INTEGER NOT NULL,
    "volumeM3" DECIMAL(8,3) NOT NULL,
    "contentClass" "CargoContentClass" NOT NULL DEFAULT 'cargo',

    CONSTRAINT "flight_cargo_unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flight_cargo_shipment" (
    "id" UUID NOT NULL,
    "flightId" UUID NOT NULL,
    "unitId" UUID,
    "commodityId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "awb" VARCHAR(12) NOT NULL,
    "pieces" INTEGER NOT NULL,
    "grossKg" INTEGER NOT NULL,
    "volumeM3" DECIMAL(8,3) NOT NULL,
    "shc" TEXT[],
    "shipper" TEXT NOT NULL,
    "consignee" TEXT NOT NULL,
    "status" "CargoShipmentStatus" NOT NULL DEFAULT 'loaded',

    CONSTRAINT "flight_cargo_shipment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "flight_cargo_unit_flightId_positionDesignator_key" ON "flight_cargo_unit"("flightId", "positionDesignator");

-- CreateIndex
CREATE INDEX "flight_cargo_unit_flightId_idx" ON "flight_cargo_unit"("flightId");

-- CreateIndex
CREATE INDEX "flight_cargo_shipment_flightId_idx" ON "flight_cargo_shipment"("flightId");

-- CreateIndex
CREATE INDEX "flight_cargo_shipment_flightId_status_idx" ON "flight_cargo_shipment"("flightId", "status");

-- CreateIndex
CREATE INDEX "flight_cargo_shipment_unitId_idx" ON "flight_cargo_shipment"("unitId");

-- AddForeignKey
ALTER TABLE "flight_cargo_unit" ADD CONSTRAINT "flight_cargo_unit_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "flight"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flight_cargo_shipment" ADD CONSTRAINT "flight_cargo_shipment_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "flight"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flight_cargo_shipment" ADD CONSTRAINT "flight_cargo_shipment_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "flight_cargo_unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
