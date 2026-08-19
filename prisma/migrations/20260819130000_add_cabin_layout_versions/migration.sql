-- CreateEnum
CREATE TYPE "CabinDeck" AS ENUM ('main', 'upper');

-- CreateTable
CREATE TABLE "cabin_layout_version" (
    "id" UUID NOT NULL,
    "layoutId" TEXT NOT NULL,
    "revision" INTEGER NOT NULL,
    "contentHash" VARCHAR(64) NOT NULL,
    "aircraftType" TEXT NOT NULL,
    "aircraftTypeDisplayed" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "haulType" TEXT NOT NULL,
    "isDualDeck" BOOLEAN NOT NULL,
    "totalSeats" INTEGER NOT NULL,
    "seatCounts" JSONB NOT NULL,
    "lastUpdated" DATE NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rawPayload" JSONB NOT NULL,

    CONSTRAINT "cabin_layout_version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cabin_layout_deck" (
    "id" UUID NOT NULL,
    "versionId" UUID NOT NULL,
    "deck" "CabinDeck" NOT NULL,
    "sourceSlug" TEXT NOT NULL,
    "canvasWidth" INTEGER NOT NULL,
    "canvasHeight" INTEGER NOT NULL,
    "seatCount" INTEGER NOT NULL,
    "lastUpdated" DATE NOT NULL,
    "assets" JSONB NOT NULL,
    "cabins" JSONB NOT NULL,

    CONSTRAINT "cabin_layout_deck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cabin_layout_seat" (
    "id" UUID NOT NULL,
    "deckId" UUID NOT NULL,
    "designator" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "rotation" DOUBLE PRECISION NOT NULL,
    "reversed" BOOLEAN NOT NULL,
    "cabin" TEXT NOT NULL,
    "rating" TEXT,
    "color" TEXT NOT NULL,
    "bookable" BOOLEAN NOT NULL,
    "blocked" BOOLEAN NOT NULL,
    "crewRest" BOOLEAN NOT NULL,
    "windowStatus" TEXT,
    "seatProduct" TEXT,
    "comments" JSONB NOT NULL,

    CONSTRAINT "cabin_layout_seat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cabin_layout_version_layoutId_revision_key" ON "cabin_layout_version"("layoutId", "revision");

-- CreateIndex
CREATE INDEX "cabin_layout_version_layoutId_idx" ON "cabin_layout_version"("layoutId");

-- CreateIndex
CREATE UNIQUE INDEX "cabin_layout_deck_versionId_deck_key" ON "cabin_layout_deck"("versionId", "deck");

-- CreateIndex
CREATE INDEX "cabin_layout_deck_versionId_idx" ON "cabin_layout_deck"("versionId");

-- CreateIndex
CREATE UNIQUE INDEX "cabin_layout_seat_deckId_designator_key" ON "cabin_layout_seat"("deckId", "designator");

-- CreateIndex
CREATE INDEX "cabin_layout_seat_deckId_idx" ON "cabin_layout_seat"("deckId");

-- AddForeignKey
ALTER TABLE "cabin_layout_version" ADD CONSTRAINT "cabin_layout_version_layoutId_fkey" FOREIGN KEY ("layoutId") REFERENCES "cabin_layout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cabin_layout_deck" ADD CONSTRAINT "cabin_layout_deck_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "cabin_layout_version"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cabin_layout_seat" ADD CONSTRAINT "cabin_layout_seat_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "cabin_layout_deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;
