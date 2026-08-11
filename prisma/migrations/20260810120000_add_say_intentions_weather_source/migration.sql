-- CreateEnum
CREATE TYPE "WeatherSource" AS ENUM ('aviation_weather_gov', 'say_intentions');

-- CreateEnum
CREATE TYPE "WeatherInformationType" AS ENUM ('atis', 'metar', 'taf');

-- AlterTable
ALTER TABLE "airport" ADD COLUMN "monitorWeather" BOOLEAN NOT NULL DEFAULT false;

-- Carry the monitoring flag off the weather record and onto the airport.
UPDATE "airport" AS a
SET "monitorWeather" = w."watch"
FROM "airport_weather" AS w
WHERE w."airportId" = a."id";

-- AlterTable
ALTER TABLE "user" ADD COLUMN "defaultWeatherSource" "WeatherSource" NOT NULL DEFAULT 'aviation_weather_gov';

-- Step the legacy weather table aside so the reshaped one can take its name and
-- Prisma's constraint names without colliding.
ALTER TABLE "airport_weather" RENAME TO "airport_weather_legacy";
ALTER INDEX "airport_weather_pkey" RENAME TO "airport_weather_legacy_pkey";

-- CreateTable
CREATE TABLE "airport_weather" (
    "id" UUID NOT NULL,
    "airportId" UUID NOT NULL,
    "source" "WeatherSource" NOT NULL,
    "informationType" "WeatherInformationType" NOT NULL,
    "content" TEXT NOT NULL,
    "lastFetched" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "airport_weather_pkey" PRIMARY KEY ("id")
);

-- Each legacy row contributes one report per column pair that actually held text.
-- A row that only ever carried the watch flag contributes none; its monitoring state
-- was already preserved above. lastFetched is NOT NULL while the legacy timestamps
-- were not, so an undated report is dated at migration time and corrected by the
-- next refresh cycle.
INSERT INTO "airport_weather" ("id", "airportId", "source", "informationType", "content", "lastFetched")
SELECT
    gen_random_uuid(),
    "airportId",
    'aviation_weather_gov'::"WeatherSource",
    'metar'::"WeatherInformationType",
    "metar",
    COALESCE("metarLastUpdate", NOW())
FROM "airport_weather_legacy"
WHERE "metar" IS NOT NULL
UNION ALL
SELECT
    gen_random_uuid(),
    "airportId",
    'aviation_weather_gov'::"WeatherSource",
    'taf'::"WeatherInformationType",
    "taf",
    COALESCE("tafLastUpdate", NOW())
FROM "airport_weather_legacy"
WHERE "taf" IS NOT NULL;

-- DropTable
DROP TABLE "airport_weather_legacy";

-- CreateIndex
CREATE UNIQUE INDEX "airport_weather_airportId_source_informationType_key" ON "airport_weather"("airportId", "source", "informationType");

-- AddForeignKey
ALTER TABLE "airport_weather" ADD CONSTRAINT "airport_weather_airportId_fkey" FOREIGN KEY ("airportId") REFERENCES "airport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
