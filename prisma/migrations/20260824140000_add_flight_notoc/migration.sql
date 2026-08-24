-- CreateEnum
CREATE TYPE "NotocStage" AS ENUM ('preliminary', 'final');

-- CreateTable
CREATE TABLE "flight_notoc" (
    "id" UUID NOT NULL,
    "flightId" UUID NOT NULL,
    "stage" "NotocStage" NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL,
    "document" JSONB NOT NULL,
    "acknowledgedById" UUID,
    "acknowledgedAt" TIMESTAMP(3),

    CONSTRAINT "flight_notoc_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "flight_notoc_flightId_idx" ON "flight_notoc"("flightId");

-- CreateIndex
CREATE UNIQUE INDEX "flight_notoc_flightId_stage_key" ON "flight_notoc"("flightId", "stage");

-- AddForeignKey
ALTER TABLE "flight_notoc" ADD CONSTRAINT "flight_notoc_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "Flight"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flight_notoc" ADD CONSTRAINT "flight_notoc_acknowledgedById_fkey" FOREIGN KEY ("acknowledgedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
