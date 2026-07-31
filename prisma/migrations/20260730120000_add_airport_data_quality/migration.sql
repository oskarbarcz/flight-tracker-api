-- CreateEnum
CREATE TYPE "DataQuality" AS ENUM ('low', 'high', 'flagship');

-- AlterTable
ALTER TABLE "airport" ADD COLUMN     "dataQuality" "DataQuality" NOT NULL DEFAULT 'low';
