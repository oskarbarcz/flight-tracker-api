-- CreateEnum
CREATE TYPE "user_token_type" AS ENUM ('password_reset', 'email_change');

-- CreateTable
CREATE TABLE "user_token" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "user_token_type" NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "newEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),

    CONSTRAINT "user_token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_token_type_tokenHash_key" ON "user_token"("type", "tokenHash");

-- CreateIndex
CREATE INDEX "user_token_userId_type_idx" ON "user_token"("userId", "type");

-- AddForeignKey
ALTER TABLE "user_token" ADD CONSTRAINT "user_token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "emailConfirmedAt" TIMESTAMP(3);

-- Every address that already exists predates confirmation and is treated as
-- confirmed; only addresses set from now on have to be proven.
UPDATE "user" SET "emailConfirmedAt" = NOW() WHERE "emailConfirmedAt" IS NULL;
