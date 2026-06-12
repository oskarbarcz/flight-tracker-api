-- CreateEnum
CREATE TYPE "delay_reason_code" AS ENUM ('AMZ', 'ATZ', 'AMC', 'RLL', 'RLP', 'RLS', 'RLV', 'ESR', 'END', 'ESM', 'GBT', 'GBJ', 'GBS', 'ODI', 'ORA', 'ORO', 'OFL', 'OAD', 'OSM', 'OTH');

-- CreateEnum
CREATE TYPE "delay_report_status" AS ENUM ('pending', 'accepted', 'rejected');

-- CreateTable
CREATE TABLE "delay_request" (
    "id" UUID NOT NULL,
    "flightId" UUID NOT NULL,
    "totalDelayMinutes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "delay_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delay_report" (
    "id" UUID NOT NULL,
    "requestId" UUID NOT NULL,
    "delayMinutes" INTEGER NOT NULL,
    "reasonCode" "delay_reason_code" NOT NULL,
    "freeText" TEXT,
    "status" "delay_report_status" NOT NULL DEFAULT 'pending',
    "reportedById" UUID NOT NULL,
    "decidedById" UUID,
    "rejectionReason" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "delay_report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "delay_request_flightId_key" ON "delay_request"("flightId");

-- CreateIndex
CREATE INDEX "delay_report_requestId_idx" ON "delay_report"("requestId");

-- CreateIndex
CREATE INDEX "delay_report_status_idx" ON "delay_report"("status");

-- AddForeignKey
ALTER TABLE "delay_request" ADD CONSTRAINT "delay_request_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "flight"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delay_report" ADD CONSTRAINT "delay_report_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "delay_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delay_report" ADD CONSTRAINT "delay_report_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delay_report" ADD CONSTRAINT "delay_report_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
