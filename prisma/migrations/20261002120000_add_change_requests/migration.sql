-- CreateEnum
CREATE TYPE "change_request_resource" AS ENUM ('airport');

-- CreateEnum
CREATE TYPE "change_request_status" AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');

-- CreateTable
CREATE TABLE "change_request" (
    "id" UUID NOT NULL,
    "resource" "change_request_resource" NOT NULL,
    "targetId" UUID NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "change_request_status" NOT NULL DEFAULT 'pending',
    "requestedById" UUID NOT NULL,
    "decidedById" UUID,
    "rejectionReason" TEXT,
    "appliedSnapshot" JSONB,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "change_request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "change_request_status_resource_idx" ON "change_request"("status", "resource");

-- CreateIndex
CREATE INDEX "change_request_resource_targetId_idx" ON "change_request"("resource", "targetId");

-- CreateIndex
CREATE INDEX "change_request_requestedById_idx" ON "change_request"("requestedById");

-- AddForeignKey
ALTER TABLE "change_request" ADD CONSTRAINT "change_request_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "change_request" ADD CONSTRAINT "change_request_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

