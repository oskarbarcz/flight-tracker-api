-- CreateTable
CREATE TABLE "runway" (
    "id" UUID NOT NULL,
    "airportId" UUID NOT NULL,
    "designator" VARCHAR(4) NOT NULL,
    "length" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "displace" INTEGER,
    "trueHeading" INTEGER,
    "magneticHeading" INTEGER NOT NULL,
    "elevation" INTEGER,
    "surfaceType" VARCHAR(16) NOT NULL,
    "lightingType" VARCHAR(16) NOT NULL,

    CONSTRAINT "runway_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "runway" ADD CONSTRAINT "runway_airportId_fkey" FOREIGN KEY ("airportId") REFERENCES "airport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
