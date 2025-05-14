/*
  Warnings:

  - A unique constraint covering the columns `[currentRotationId]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "flight" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "rotationId" UUID;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "currentRotationId" UUID;

-- CreateTable
CREATE TABLE "rotation" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rotation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_currentRotationId_key" ON "user"("currentRotationId");

-- AddForeignKey
ALTER TABLE "flight" ADD CONSTRAINT "flight_rotationId_fkey" FOREIGN KEY ("rotationId") REFERENCES "rotation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rotation" ADD CONSTRAINT "rotation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
