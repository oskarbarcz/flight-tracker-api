-- CreateEnum
CREATE TYPE "FlightTracking" AS ENUM ('public', 'private', 'disabled');

-- AlterTable
ALTER TABLE "flight" ADD COLUMN     "tracking" "FlightTracking" NOT NULL DEFAULT 'private';
