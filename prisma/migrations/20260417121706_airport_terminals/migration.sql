-- CreateTable
CREATE TABLE "terminal" (
    "id" UUID NOT NULL,
    "airportId" UUID NOT NULL,
    "shortName" VARCHAR(8) NOT NULL,
    "fullName" VARCHAR(128) NOT NULL,
    "averageTaxiTime" INTEGER NOT NULL,
    "operatorCodes" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "terminal_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "terminal" ADD CONSTRAINT "terminal_airportId_fkey" FOREIGN KEY ("airportId") REFERENCES "airport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
