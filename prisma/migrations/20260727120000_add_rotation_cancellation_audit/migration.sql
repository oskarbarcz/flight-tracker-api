-- AlterTable
ALTER TABLE "rotation" ADD COLUMN     "canceledAt" TIMESTAMP(3),
ADD COLUMN     "canceledById" UUID,
ADD COLUMN     "cancellationReason" TEXT;

-- AddForeignKey
ALTER TABLE "rotation" ADD CONSTRAINT "rotation_canceledById_fkey" FOREIGN KEY ("canceledById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
