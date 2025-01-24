/*
  Warnings:

  - Added the required column `operatorId` to the `flight` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "flight" ADD COLUMN     "operatorId" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "flight" ADD CONSTRAINT "flight_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "operator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
