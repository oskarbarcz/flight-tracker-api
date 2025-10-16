-- CreateTable
CREATE TABLE "flight_diversion" (
    "id" UUID NOT NULL,
    "reportedBy" UUID NOT NULL,
    "reporterRole" TEXT NOT NULL,
    "flightId" UUID NOT NULL,
    "airportId" UUID NOT NULL,
    "decisionTime" TIMESTAMP(3) NOT NULL,
    "estimatedTimeAtDestination" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "position" JSONB NOT NULL,
    "freeText" TEXT,
    "notifySecurityOnGround" BOOLEAN NOT NULL,
    "notifyMedicalOnGround" BOOLEAN NOT NULL,
    "notifyFirefightersOnGround" BOOLEAN NOT NULL,

    CONSTRAINT "flight_diversion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "flight_diversion_flightId_key" ON "flight_diversion"("flightId");

-- AddForeignKey
ALTER TABLE "flight_diversion" ADD CONSTRAINT "flight_diversion_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "flight"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flight_diversion" ADD CONSTRAINT "flight_diversion_reportedBy_fkey" FOREIGN KEY ("reportedBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flight_diversion" ADD CONSTRAINT "flight_diversion_airportId_fkey" FOREIGN KEY ("airportId") REFERENCES "airport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
