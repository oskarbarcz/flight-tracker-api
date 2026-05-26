-- AlterTable
ALTER TABLE "airport" ADD COLUMN "shape" JSONB;

-- AlterTable
ALTER TABLE "terminal" ADD COLUMN "shape" JSONB;

-- AlterTable
ALTER TABLE "gate" ADD COLUMN "coordinates" JSONB;
