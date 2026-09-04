-- AlterTable
ALTER TABLE "flight"
    ADD COLUMN "atcRoute" TEXT;

-- AlterTable
ALTER TABLE "flight_route_fix"
    ADD COLUMN "fuelFlow" INTEGER,
    ADD COLUMN "fuelLeg" INTEGER,
    ADD COLUMN "fuelUsed" INTEGER,
    ADD COLUMN "fuelMinimumOnBoard" INTEGER,
    ADD COLUMN "fuelPlannedOnBoard" INTEGER,
    ADD COLUMN "oat" INTEGER,
    ADD COLUMN "isaDeviation" INTEGER,
    ADD COLUMN "windDirection" INTEGER,
    ADD COLUMN "windSpeed" INTEGER,
    ADD COLUMN "windLevels" JSONB NOT NULL DEFAULT '[]',
    ADD COLUMN "tropopause" INTEGER,
    ADD COLUMN "mora" INTEGER,
    ADD COLUMN "fir" VARCHAR(4);
