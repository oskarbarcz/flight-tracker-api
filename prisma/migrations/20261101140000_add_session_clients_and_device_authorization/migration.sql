-- CreateEnum
CREATE TYPE "session_client" AS ENUM ('web', 'transponder');

-- CreateEnum
CREATE TYPE "device_authorization_status" AS ENUM ('pending', 'approved', 'denied');

-- AlterTable
ALTER TABLE "jwt_refresh_token" ADD COLUMN     "client" "session_client" NOT NULL DEFAULT 'web',
ADD COLUMN     "deviceName" VARCHAR(64),
ADD COLUMN     "lastUsedAt" TIMESTAMP(3);

UPDATE "jwt_refresh_token" SET "lastUsedAt" = "createdAt";

ALTER TABLE "jwt_refresh_token" ALTER COLUMN "lastUsedAt" SET NOT NULL;

-- CreateTable
CREATE TABLE "device_authorization" (
    "id" UUID NOT NULL,
    "deviceCode" TEXT NOT NULL,
    "userCode" VARCHAR(8) NOT NULL,
    "client" "session_client" NOT NULL,
    "deviceName" VARCHAR(64),
    "status" "device_authorization_status" NOT NULL DEFAULT 'pending',
    "userId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_authorization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "device_authorization_deviceCode_key" ON "device_authorization"("deviceCode");

-- CreateIndex
CREATE UNIQUE INDEX "device_authorization_userCode_key" ON "device_authorization"("userCode");

-- AddForeignKey
ALTER TABLE "device_authorization" ADD CONSTRAINT "device_authorization_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
