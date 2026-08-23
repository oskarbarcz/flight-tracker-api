-- CreateEnum
CREATE TYPE "CargoTransferRole" AS ENUM ('local', 'outbound_transfer', 'inbound_transfer', 'through_transfer');

-- AlterTable
ALTER TABLE "flight_cargo_unit" ADD COLUMN     "beyondDestination" VARCHAR(3),
ADD COLUMN     "sealed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "flight_cargo_shipment" ADD COLUMN     "origin" VARCHAR(3) NOT NULL,
ADD COLUMN     "destination" VARCHAR(3) NOT NULL,
ADD COLUMN     "transferRole" "CargoTransferRole" NOT NULL,
ADD COLUMN     "onwardCarrier" VARCHAR(2),
ADD COLUMN     "onwardFlightNumber" VARCHAR(8),
ADD COLUMN     "connectionMinutes" INTEGER;

-- CreateIndex
CREATE INDEX "flight_cargo_shipment_flightId_transferRole_idx" ON "flight_cargo_shipment"("flightId", "transferRole");
