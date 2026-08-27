-- Airport cities become records. Each distinct city name within a country becomes one
-- city, and every airport points at the one it belongs to.

-- CreateTable
CREATE TABLE "city" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "country" VARCHAR(2) NOT NULL,

    CONSTRAINT "city_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "city_name_country_key" ON "city"("name", "country");

INSERT INTO "city" ("id", "name", "country")
SELECT gen_random_uuid(), a."city", a."country"
FROM "airport" a
GROUP BY a."city", a."country";

-- AlterTable
ALTER TABLE "airport" ADD COLUMN "cityId" UUID;

UPDATE "airport" a
SET "cityId" = c."id"
FROM "city" c
WHERE c."name" = a."city" AND c."country" = a."country";

DO $$
DECLARE
    unplaced TEXT;
BEGIN
    SELECT string_agg(DISTINCT "icaoCode", ', ') INTO unplaced
    FROM "airport"
    WHERE "cityId" IS NULL;

    IF unplaced IS NOT NULL THEN
        RAISE EXCEPTION 'Cannot place airports in a city: %', unplaced;
    END IF;
END $$;

ALTER TABLE "airport" ALTER COLUMN "cityId" SET NOT NULL;
ALTER TABLE "airport" DROP COLUMN "city";

-- CreateIndex
CREATE INDEX "airport_cityId_idx" ON "airport"("cityId");

-- AddForeignKey
ALTER TABLE "airport" ADD CONSTRAINT "airport_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "city"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
