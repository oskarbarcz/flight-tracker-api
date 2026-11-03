-- AlterTable
ALTER TABLE "flight_route_fix" ADD COLUMN     "fuelActualOnBoard" INTEGER,
ADD COLUMN     "fuelReportedAt" TIMESTAMP(3);
