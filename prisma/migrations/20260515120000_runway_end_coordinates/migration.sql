-- AlterTable: add nullable column first, then backfill, then enforce NOT NULL.
ALTER TABLE "runway" ADD COLUMN "coordinates" JSONB;

UPDATE "runway"
SET "coordinates" = "airport"."location"
FROM "airport"
WHERE "runway"."airportId" = "airport"."id";

ALTER TABLE "runway" ALTER COLUMN "coordinates" SET NOT NULL;
