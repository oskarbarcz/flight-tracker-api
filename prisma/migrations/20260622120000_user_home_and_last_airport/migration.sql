-- AlterTable
ALTER TABLE "user"
ADD COLUMN  "homeAirportId"        UUID,
ADD COLUMN  "lastAirportId"        UUID,
ADD COLUMN  "lastAirportUpdatedAt" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_homeAirportId_fkey" FOREIGN KEY ("homeAirportId") REFERENCES "airport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_lastAirportId_fkey" FOREIGN KEY ("lastAirportId") REFERENCES "airport"("id") ON DELETE SET NULL ON UPDATE CASCADE;
