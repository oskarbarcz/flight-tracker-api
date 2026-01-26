-- CreateEnum
CREATE TYPE "FlightSource" AS ENUM ('manual', 'simbrief');

-- AlterTable
ALTER TABLE "flight" ADD COLUMN     "source" "FlightSource" NOT NULL DEFAULT 'manual';

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "simbriefUserId" TEXT;
