-- CreateEnum
CREATE TYPE "FlightEventScope" AS ENUM ('system', 'operations', 'user');

-- CreateTable
CREATE TABLE "flight_event" (
    "id" UUID NOT NULL,
    "scope" "FlightEventScope" NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "flightId" UUID NOT NULL,
    "actorId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flight_event_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "flight_event" ADD CONSTRAINT "flight_event_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "flight"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flight_event" ADD CONSTRAINT "flight_event_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
