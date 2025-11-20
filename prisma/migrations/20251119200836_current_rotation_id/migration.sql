-- AlterTable
ALTER TABLE "user" ADD COLUMN     "currentRotationId" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "user_currentRotationId_key" ON "user"("currentRotationId");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_currentRotationId_fkey" FOREIGN KEY ("currentRotationId") REFERENCES "rotation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
