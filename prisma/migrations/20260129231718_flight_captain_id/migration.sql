-- AlterTable
ALTER TABLE "flight" ADD COLUMN     "captainId" UUID;

-- AddForeignKey
ALTER TABLE "flight" ADD CONSTRAINT "flight_captainId_fkey" FOREIGN KEY ("captainId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
