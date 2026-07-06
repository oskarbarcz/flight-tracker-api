-- CreateTable
CREATE TABLE "user_aircraft" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "aircraftId" UUID NOT NULL,
    "flightId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_aircraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_aircraft_userId_idx" ON "user_aircraft"("userId");

-- AddForeignKey
ALTER TABLE "user_aircraft" ADD CONSTRAINT "user_aircraft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_aircraft" ADD CONSTRAINT "user_aircraft_aircraftId_fkey" FOREIGN KEY ("aircraftId") REFERENCES "aircraft"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_aircraft" ADD CONSTRAINT "user_aircraft_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "flight"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Backfill: create a user_aircraft entry for every existing captained flight
INSERT INTO "user_aircraft" ("id", "userId", "aircraftId", "flightId", "createdAt")
SELECT gen_random_uuid(), "captainId", "aircraftId", "id", CURRENT_TIMESTAMP
FROM "flight"
WHERE "captainId" IS NOT NULL;
