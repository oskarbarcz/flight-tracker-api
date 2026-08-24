-- CreateEnum
CREATE TYPE "CargoOffloadReason" AS ENUM ('payload_restriction', 'space_restriction');

-- AlterTable
ALTER TABLE "flight_cargo_shipment" ADD COLUMN     "offloadReason" "CargoOffloadReason",
ADD COLUMN     "offloadedFrom" VARCHAR(8);
