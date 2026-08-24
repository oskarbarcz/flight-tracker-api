-- AlterTable
ALTER TABLE "flight_cargo_unit" ADD COLUMN     "bagCount" INTEGER,
ADD COLUMN     "priority" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "baggageSource" VARCHAR(16);
