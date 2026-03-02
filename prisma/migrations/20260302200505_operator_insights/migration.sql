-- CreateEnum
CREATE TYPE "OperatorType" AS ENUM ('legacy', 'low_cost', 'charter', 'government_military');

-- AlterTable
ALTER TABLE "operator"
ADD COLUMN     "avgFleetAge" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "backgroundUrl" TEXT,
ADD COLUMN     "fleetSize" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "fleetTypes" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "hubs" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "type" "OperatorType" NOT NULL DEFAULT 'legacy';
