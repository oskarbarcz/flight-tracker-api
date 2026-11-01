-- DropForeignKey
ALTER TABLE "rotation" DROP CONSTRAINT "rotation_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "user_postcard" DROP CONSTRAINT "user_postcard_postcardId_fkey";

-- AddForeignKey
ALTER TABLE "user_postcard" ADD CONSTRAINT "user_postcard_postcardId_fkey" FOREIGN KEY ("postcardId") REFERENCES "postcard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rotation" ADD CONSTRAINT "rotation_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
