-- AlterTable
ALTER TABLE "aircraft" ADD COLUMN     "lastGateId" UUID;

-- AddForeignKey
ALTER TABLE "aircraft" ADD CONSTRAINT "aircraft_lastGateId_fkey" FOREIGN KEY ("lastGateId") REFERENCES "gate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
