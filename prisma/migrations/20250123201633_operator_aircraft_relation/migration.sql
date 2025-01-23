-- AlterTable
ALTER TABLE "aircraft" ADD COLUMN     "operatorId" UUID;

-- AddForeignKey
ALTER TABLE "aircraft" ADD CONSTRAINT "aircraft_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "operator"("id") ON DELETE SET NULL ON UPDATE CASCADE;
