-- CreateTable
CREATE TABLE "aircraft" (
    "id" UUID NOT NULL,
    "icaoCode" VARCHAR(4) NOT NULL,
    "shortName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "registration" TEXT NOT NULL,
    "selcal" TEXT NOT NULL,
    "livery" TEXT NOT NULL,

    CONSTRAINT "aircraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "airport" (
    "id" UUID NOT NULL,
    "icaoCode" VARCHAR(4) NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,

    CONSTRAINT "airport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operator" (
    "id" UUID NOT NULL,
    "icaoCode" VARCHAR(4) NOT NULL,
    "shortName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "callsign" TEXT NOT NULL,

    CONSTRAINT "operator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flight" (
    "id" UUID NOT NULL,
    "flightNumber" TEXT NOT NULL,
    "callsign" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "aircraftId" UUID NOT NULL,
    "timesheet" JSONB NOT NULL,

    CONSTRAINT "flight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "airport_flight" (
    "airportId" UUID NOT NULL,
    "flightId" UUID NOT NULL,
    "airportType" TEXT NOT NULL,

    CONSTRAINT "airport_flight_pkey" PRIMARY KEY ("airportId","flightId")
);

-- CreateIndex
CREATE UNIQUE INDEX "aircraft_icaoCode_key" ON "aircraft"("icaoCode");

-- CreateIndex
CREATE UNIQUE INDEX "aircraft_registration_key" ON "aircraft"("registration");

-- CreateIndex
CREATE UNIQUE INDEX "airport_icaoCode_key" ON "airport"("icaoCode");

-- AddForeignKey
ALTER TABLE "flight" ADD CONSTRAINT "flight_aircraftId_fkey" FOREIGN KEY ("aircraftId") REFERENCES "aircraft"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "airport_flight" ADD CONSTRAINT "airport_flight_airportId_fkey" FOREIGN KEY ("airportId") REFERENCES "airport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "airport_flight" ADD CONSTRAINT "airport_flight_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "flight"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
