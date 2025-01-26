/*
  Warnings:

  - A unique constraint covering the columns `[currentFlightId]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "currentFlightId" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "user_currentFlightId_key" ON "user"("currentFlightId");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_currentFlightId_fkey" FOREIGN KEY ("currentFlightId") REFERENCES "flight"("id") ON DELETE SET NULL ON UPDATE CASCADE;
