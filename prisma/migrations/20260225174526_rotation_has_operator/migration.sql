-- AlterTable
ALTER TABLE "rotation" ADD COLUMN     "operatorId" UUID;

-- AddForeignKey
ALTER TABLE "rotation" ADD CONSTRAINT "rotation_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "operator"("id") ON DELETE SET NULL ON UPDATE CASCADE;
