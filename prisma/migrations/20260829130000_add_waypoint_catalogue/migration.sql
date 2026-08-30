-- Waypoints accumulate from every imported flight plan. The system holds no navigation database,
-- so the catalogue is built from what the plans publish anyway: an identifier, a position, a kind
-- and, where the plan reports one, a frequency.

-- Identifiers are not unique worldwide, so a waypoint is keyed by identifier and ICAO region.
-- Oceanic track fixes arrive without a region, and Postgres treats NULLs as distinct in a unique
-- index by default, which would let the same track fix be catalogued repeatedly. NULLS NOT
-- DISTINCT makes one row per identifier where no region is published.

-- CreateEnum
CREATE TYPE "WaypointKind" AS ENUM ('waypoint', 'navaid');

-- CreateTable
CREATE TABLE "waypoint" (
    "id" UUID NOT NULL,
    "ident" VARCHAR(16) NOT NULL,
    "icaoRegion" VARCHAR(2),
    "kind" "WaypointKind" NOT NULL,
    "posLat" DECIMAL(9,6) NOT NULL,
    "posLong" DECIMAL(9,6) NOT NULL,
    "frequency" DECIMAL(6,2),
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "waypoint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "waypoint_ident_icaoRegion_key" ON "waypoint"("ident", "icaoRegion") NULLS NOT DISTINCT;

-- CreateIndex
CREATE INDEX "waypoint_ident_idx" ON "waypoint"("ident");
