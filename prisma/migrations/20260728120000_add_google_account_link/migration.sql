-- AlterTable
ALTER TABLE "user" ALTER COLUMN "password" DROP NOT NULL,
ADD COLUMN     "googleId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_googleId_key" ON "user"("googleId");
