-- CreateEnum
CREATE TYPE "OperatorServiceType" AS ENUM ('passenger', 'cargo', 'both');

-- AlterTable
ALTER TABLE "operator" ADD COLUMN     "serviceType" "OperatorServiceType" NOT NULL DEFAULT 'passenger';
