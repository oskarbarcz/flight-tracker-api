-- CreateEnum
CREATE TYPE "FlightServiceType" AS ENUM ('passenger', 'cargo');

-- AlterTable
ALTER TABLE "flight" ADD COLUMN     "serviceType" "FlightServiceType" NOT NULL DEFAULT 'passenger';
