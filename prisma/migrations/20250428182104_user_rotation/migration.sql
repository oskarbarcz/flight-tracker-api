-- AlterTable
ALTER TABLE "flight"
    ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN "rotationId" UUID;

-- CreateTable
CREATE TABLE "rotation" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "pilotId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NULL,

    CONSTRAINT "rotation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "flight" ADD CONSTRAINT "flight_rotationId_fkey" FOREIGN KEY ("rotationId") REFERENCES "rotation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
