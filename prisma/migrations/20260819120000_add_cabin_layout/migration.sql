-- CreateTable
CREATE TABLE "cabin_layout" (
    "id" TEXT NOT NULL,
    "airlineIata" VARCHAR(2) NOT NULL,
    "aircraftIata" VARCHAR(6) NOT NULL,
    "variant" TEXT,
    "sourceSlugs" TEXT[],
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "retiredAt" TIMESTAMP(3),

    CONSTRAINT "cabin_layout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cabin_layout_airlineIata_aircraftIata_idx" ON "cabin_layout"("airlineIata", "aircraftIata");

-- CreateIndex
CREATE INDEX "cabin_layout_retiredAt_idx" ON "cabin_layout"("retiredAt");
