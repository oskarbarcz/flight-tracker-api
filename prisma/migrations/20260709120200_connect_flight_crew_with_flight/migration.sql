-- CreateTable
CREATE TABLE "crew_flight" (
    "crewId" UUID NOT NULL,
    "flightId" UUID NOT NULL,

    CONSTRAINT "crew_flight_pkey" PRIMARY KEY ("crewId","flightId")
);

-- AddForeignKey
ALTER TABLE "crew_flight" ADD CONSTRAINT "crew_flight_crewId_fkey" FOREIGN KEY ("crewId") REFERENCES "crew"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crew_flight" ADD CONSTRAINT "crew_flight_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "flight"("id") ON DELETE CASCADE ON UPDATE CASCADE;
