-- CreateEnum
CREATE TYPE "OceanicRouting" AS ENUM ('track', 'track_geometry', 'random');

-- CreateEnum
CREATE TYPE "TrackDirection" AS ENUM ('east', 'west');

-- AlterTable
ALTER TABLE "flight"
    ADD COLUMN "oceanicRouting" "OceanicRouting",
    ADD COLUMN "oceanicTrackId" VARCHAR(8),
    ADD COLUMN "oceanicTrackDirection" "TrackDirection";

-- CreateTable
CREATE TABLE "flight_oceanic_track" (
    "id" UUID NOT NULL,
    "flightId" UUID NOT NULL,
    "identifier" VARCHAR(8) NOT NULL,
    "direction" "TrackDirection" NOT NULL,
    "tmi" VARCHAR(8) NOT NULL,
    "issuingOca" VARCHAR(8),
    "route" TEXT,
    "levels" INTEGER[],
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "fixes" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "flight_oceanic_track_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "flight_oceanic_track_flightId_idx" ON "flight_oceanic_track"("flightId");

-- CreateIndex
CREATE UNIQUE INDEX "flight_oceanic_track_flightId_identifier_tmi_key" ON "flight_oceanic_track"("flightId", "identifier", "tmi");

-- AddForeignKey
ALTER TABLE "flight_oceanic_track" ADD CONSTRAINT "flight_oceanic_track_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "flight"("id") ON DELETE CASCADE ON UPDATE CASCADE;
