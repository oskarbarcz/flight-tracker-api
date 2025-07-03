-- AlterTable
ALTER TABLE "user" ADD COLUMN     "pilotLicenseId" VARCHAR(8);

-- AddForeignKey
ALTER TABLE "rotation" ADD CONSTRAINT "rotation_pilotId_fkey" FOREIGN KEY ("pilotId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
