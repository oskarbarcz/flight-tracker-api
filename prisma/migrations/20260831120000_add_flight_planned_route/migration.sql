-- CreateTable
CREATE TABLE "flight_route_fix" (
    "id" UUID NOT NULL,
    "flightId" UUID NOT NULL,
    "ordinal" INTEGER NOT NULL,
    "ident" VARCHAR(16) NOT NULL,
    "posLat" DECIMAL(9,6) NOT NULL,
    "posLong" DECIMAL(9,6) NOT NULL,
    "altitude" INTEGER NOT NULL,
    "elapsedSeconds" INTEGER NOT NULL,
    "distanceNm" INTEGER,
    "trackTrue" INTEGER,
    "trackMag" INTEGER,
    "viaAirway" VARCHAR(16),
    "stage" VARCHAR(3) NOT NULL,

    CONSTRAINT "flight_route_fix_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "flight_route_fix_flightId_ordinal_key" ON "flight_route_fix"("flightId", "ordinal");

-- AddForeignKey
ALTER TABLE "flight_route_fix" ADD CONSTRAINT "flight_route_fix_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "flight"("id") ON DELETE CASCADE ON UPDATE CASCADE;
