-- CreateEnum
CREATE TYPE "Continent" AS ENUM ('africa', 'asia', 'europe', 'north_america', 'south_america', 'oceania');

-- AlterTable
ALTER TABLE "airport" ADD COLUMN     "continent" "Continent",
ADD COLUMN     "location" JSONB NOT NULL DEFAULT '{"latitude": 0, "longitude": 0}';
