-- CreateEnum
CREATE TYPE "user_travel_type" AS ENUM ('performing_flight', 'dead_head_manual', 'dead_head_automatic');

-- CreateEnum
CREATE TYPE "user_travel_status" AS ENUM ('pending', 'finished');

-- CreateTable
CREATE TABLE "user_travel" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "user_travel_type" NOT NULL,
    "status" "user_travel_status" NOT NULL,
    "departureAirportId" UUID NOT NULL,
    "destinationAirportId" UUID NOT NULL,
    "distance" INTEGER NOT NULL,
    "flightId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "user_travel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_travel_userId_idx" ON "user_travel"("userId");

-- AddForeignKey
ALTER TABLE "user_travel" ADD CONSTRAINT "user_travel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_travel" ADD CONSTRAINT "user_travel_departureAirportId_fkey" FOREIGN KEY ("departureAirportId") REFERENCES "airport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_travel" ADD CONSTRAINT "user_travel_destinationAirportId_fkey" FOREIGN KEY ("destinationAirportId") REFERENCES "airport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_travel" ADD CONSTRAINT "user_travel_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "flight"("id") ON DELETE SET NULL ON UPDATE CASCADE;
