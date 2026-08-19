-- AlterTable
ALTER TABLE "aircraft" ADD COLUMN     "cabinLayout" TEXT;

-- CreateIndex
CREATE INDEX "aircraft_cabinLayout_idx" ON "aircraft"("cabinLayout");

-- AddForeignKey
ALTER TABLE "aircraft" ADD CONSTRAINT "aircraft_cabinLayout_fkey" FOREIGN KEY ("cabinLayout") REFERENCES "cabin_layout"("id") ON DELETE SET NULL ON UPDATE CASCADE;
