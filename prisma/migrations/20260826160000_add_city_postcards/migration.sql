-- One collectible postcard per city, and the pilots who hold it.

-- CreateEnum
CREATE TYPE "PostcardStatus" AS ENUM ('pending', 'ready', 'failed');

-- CreateTable
CREATE TABLE "postcard" (
    "id" UUID NOT NULL,
    "cityId" UUID NOT NULL,
    "status" "PostcardStatus" NOT NULL DEFAULT 'pending',
    "artUuid" UUID,
    "imageUrl" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "postcard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "postcard_cityId_key" ON "postcard"("cityId");

-- CreateTable
CREATE TABLE "user_postcard" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "postcardId" UUID NOT NULL,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seenAt" TIMESTAMP(3),

    CONSTRAINT "user_postcard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_postcard_userId_postcardId_key" ON "user_postcard"("userId", "postcardId");

-- CreateIndex
CREATE INDEX "user_postcard_userId_idx" ON "user_postcard"("userId");

-- AddForeignKey
ALTER TABLE "postcard" ADD CONSTRAINT "postcard_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "city"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_postcard" ADD CONSTRAINT "user_postcard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_postcard" ADD CONSTRAINT "user_postcard_postcardId_fkey" FOREIGN KEY ("postcardId") REFERENCES "postcard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
