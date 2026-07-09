-- CreateTable
CREATE TABLE "airport_weather" (
    "airportId" UUID NOT NULL,
    "metar" TEXT,
    "metarLastUpdate" TIMESTAMP(3),
    "taf" TEXT,
    "tafLastUpdate" TIMESTAMP(3),
    "watch" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "airport_weather_pkey" PRIMARY KEY ("airportId")
);

-- AddForeignKey
ALTER TABLE "airport_weather" ADD CONSTRAINT "airport_weather_airportId_fkey" FOREIGN KEY ("airportId") REFERENCES "airport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
