-- Existing gates aren't preserved across this split — clear them out first.
-- Flight.departureGateId/arrivalGateId and Aircraft.lastGateId reference gate
-- with ON DELETE SET NULL, so this also nulls those out automatically.
DELETE FROM "gate";

-- CreateTable
CREATE TABLE "parking_position" (
    "id" UUID NOT NULL,
    "airportId" UUID NOT NULL,
    "terminalId" UUID NOT NULL,
    "name" VARCHAR(16) NOT NULL,
    "bridge" VARCHAR(32) NOT NULL,
    "stairs" VARCHAR(32) NOT NULL,
    "deicing" VARCHAR(32) NOT NULL,
    "deicingDescription" TEXT,
    "gpu" VARCHAR(32) NOT NULL,
    "pca" VARCHAR(32) NOT NULL,
    "type" VARCHAR(32) NOT NULL,
    "spotType" VARCHAR(32) NOT NULL,
    "assistance" VARCHAR(32) NOT NULL,
    "location" VARCHAR(32) NOT NULL,
    "noiseSensitivity" VARCHAR(32) NOT NULL,
    "noiseSensitivityText" TEXT,
    "noiseSensitivityStartTime" VARCHAR(5),
    "noiseSensitivityEndTime" VARCHAR(5),
    "fuelingOptions" VARCHAR(32) NOT NULL,
    "coordinates" JSONB,

    CONSTRAINT "parking_position_pkey" PRIMARY KEY ("id")
);

-- AlterTable: passenger-facing gates gain a border-control category and an
-- optional (non-unique — a stand can serve more than one gate) link to their
-- parking position; drop the columns that moved to parking_position.
ALTER TABLE "gate" ADD COLUMN "category" VARCHAR(32) NOT NULL;

ALTER TABLE "gate" ADD COLUMN "parkingPositionId" UUID;

ALTER TABLE "gate"
    DROP COLUMN "bridge",
    DROP COLUMN "stairs",
    DROP COLUMN "deicing",
    DROP COLUMN "deicingDescription",
    DROP COLUMN "gpu",
    DROP COLUMN "pca",
    DROP COLUMN "parkingPositionType",
    DROP COLUMN "parkingSpotType",
    DROP COLUMN "parkingAssistance",
    DROP COLUMN "location",
    DROP COLUMN "noiseSensitivity",
    DROP COLUMN "noiseSensitivityText",
    DROP COLUMN "noiseSensitivityStartTime",
    DROP COLUMN "noiseSensitivityEndTime",
    DROP COLUMN "fuelingOptions",
    DROP COLUMN "coordinates";

-- AddForeignKey
ALTER TABLE "gate" ADD CONSTRAINT "gate_parkingPositionId_fkey" FOREIGN KEY ("parkingPositionId") REFERENCES "parking_position"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable: aircraft's last-known-gate pointer becomes last-known-parking-position.
ALTER TABLE "aircraft" RENAME COLUMN "lastGateId" TO "lastParkingPositionId";

ALTER TABLE "aircraft" DROP CONSTRAINT "aircraft_lastGateId_fkey";

ALTER TABLE "aircraft" ADD CONSTRAINT "aircraft_lastParkingPositionId_fkey" FOREIGN KEY ("lastParkingPositionId") REFERENCES "parking_position"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable: a flight is assigned to a parking position (a physical stand), not
-- a passenger gate — the gate a passenger boards through is a separate, possibly
-- many-to-one, concern.
ALTER TABLE "flight" RENAME COLUMN "departureGateId" TO "departureParkingPositionId";
ALTER TABLE "flight" RENAME COLUMN "arrivalGateId" TO "arrivalParkingPositionId";

ALTER TABLE "flight" DROP CONSTRAINT "flight_departureGateId_fkey";
ALTER TABLE "flight" DROP CONSTRAINT "flight_arrivalGateId_fkey";

ALTER TABLE "flight" ADD CONSTRAINT "flight_departureParkingPositionId_fkey" FOREIGN KEY ("departureParkingPositionId") REFERENCES "parking_position"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "flight" ADD CONSTRAINT "flight_arrivalParkingPositionId_fkey" FOREIGN KEY ("arrivalParkingPositionId") REFERENCES "parking_position"("id") ON DELETE SET NULL ON UPDATE CASCADE;
