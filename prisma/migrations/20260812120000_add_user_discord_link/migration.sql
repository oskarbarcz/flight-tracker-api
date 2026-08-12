-- AlterTable
ALTER TABLE "user" ADD COLUMN     "discordId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_discordId_key" ON "user"("discordId");
