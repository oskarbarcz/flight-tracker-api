-- CreateTable
CREATE TABLE "airport_notam" (
    "id" UUID NOT NULL,
    "airportId" UUID NOT NULL,
    "notamId" VARCHAR(16) NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL,
    "dateEffective" TIMESTAMP(3) NOT NULL,
    "dateExpire" TIMESTAMP(3),
    "dateModified" TIMESTAMP(3) NOT NULL,
    "html" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "raw" TEXT NOT NULL,
    "nrc" VARCHAR(8) NOT NULL,
    "qcode" VARCHAR(8) NOT NULL,
    "qcodeCategory" TEXT NOT NULL,
    "qcodeSubject" TEXT NOT NULL,
    "qcodeStatus" TEXT NOT NULL,

    CONSTRAINT "airport_notam_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "airport_notam_airportId_notamId_key" ON "airport_notam"("airportId", "notamId");

-- CreateIndex
CREATE INDEX "airport_notam_airportId_dateExpire_idx" ON "airport_notam"("airportId", "dateExpire");

-- AddForeignKey
ALTER TABLE "airport_notam" ADD CONSTRAINT "airport_notam_airportId_fkey" FOREIGN KEY ("airportId") REFERENCES "airport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
