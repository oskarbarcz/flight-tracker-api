-- AlterTable
ALTER TABLE "flight" ADD COLUMN     "greatCircleDistance" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "isEtops" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "route" TEXT,
ADD COLUMN     "simbriefRequestId" INTEGER,
ADD COLUMN     "simbriefSequenceId" TEXT,
ADD COLUMN     "totalFuelBurned" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "totalFlightTime" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalFuelBurned" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalGreatCircleDistance" INTEGER NOT NULL DEFAULT 0;
