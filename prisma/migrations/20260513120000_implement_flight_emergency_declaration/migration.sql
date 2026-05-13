-- CreateTable
CREATE TABLE "flight_emergency" (
    "id" UUID NOT NULL,
    "flightId" UUID NOT NULL,
    "reportedBy" UUID NOT NULL,
    "urgency" TEXT NOT NULL,
    "threatLevel" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "squawk" TEXT,
    "intention" TEXT NOT NULL,
    "lastKnownPosition" JSONB,
    "soulsOnBoard" INTEGER NOT NULL,
    "fuelEnduranceMinutes" INTEGER NOT NULL,
    "dangerousGoodsOnBoard" TEXT[],
    "freeText" TEXT NOT NULL,
    "declarationTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" UUID,

    CONSTRAINT "flight_emergency_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "flight_emergency_flightId_idx" ON "flight_emergency"("flightId");

-- AddForeignKey
ALTER TABLE "flight_emergency" ADD CONSTRAINT "flight_emergency_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "flight"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flight_emergency" ADD CONSTRAINT "flight_emergency_reportedBy_fkey" FOREIGN KEY ("reportedBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flight_emergency" ADD CONSTRAINT "flight_emergency_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
