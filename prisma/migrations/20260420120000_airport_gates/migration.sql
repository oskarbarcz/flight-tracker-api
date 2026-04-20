-- CreateTable
CREATE TABLE "gate" (
    "id" UUID NOT NULL,
    "airportId" UUID NOT NULL,
    "terminalId" UUID NOT NULL,
    "name" VARCHAR(16) NOT NULL,
    "bridge" VARCHAR(32) NOT NULL,
    "stairs" VARCHAR(32) NOT NULL,
    "deicing" VARCHAR(32) NOT NULL,
    "gpu" VARCHAR(32) NOT NULL,
    "pca" VARCHAR(32) NOT NULL,
    "parkingPositionType" VARCHAR(32) NOT NULL,
    "parkingSpotType" VARCHAR(32) NOT NULL,
    "parkingAssistance" VARCHAR(32) NOT NULL,
    "location" VARCHAR(32) NOT NULL,
    "noiseSensitivity" VARCHAR(32) NOT NULL,
    "fuelingOptions" VARCHAR(32) NOT NULL,

    CONSTRAINT "gate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "gate" ADD CONSTRAINT "gate_terminalId_fkey" FOREIGN KEY ("terminalId") REFERENCES "terminal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
