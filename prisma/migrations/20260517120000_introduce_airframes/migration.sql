-- AlterTable: replace legacy aircraft-type columns (icaoCode, shortName, fullName)
-- with a single `type` field (ICAO aircraft type designator) that references
-- the curated airframes list defined in src/modules/airframes.
ALTER TABLE "aircraft" ADD COLUMN "type" VARCHAR(4);

UPDATE "aircraft" SET "type" = "icaoCode";

ALTER TABLE "aircraft" ALTER COLUMN "type" SET NOT NULL;

ALTER TABLE "aircraft" DROP COLUMN "icaoCode";
ALTER TABLE "aircraft" DROP COLUMN "shortName";
ALTER TABLE "aircraft" DROP COLUMN "fullName";
