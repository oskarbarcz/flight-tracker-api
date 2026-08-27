-- Every arrival records the city the aircraft landed in, alongside the country it
-- already stamps. Backfilled from flights completed before this existed.

-- CreateTable
CREATE TABLE "user_city_visit" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "cityId" UUID NOT NULL,
    "flightId" UUID NOT NULL,
    "airportId" UUID NOT NULL,
    "visitedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_city_visit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_city_visit_userId_flightId_key" ON "user_city_visit"("userId", "flightId");

-- CreateIndex
CREATE INDEX "user_city_visit_userId_cityId_idx" ON "user_city_visit"("userId", "cityId");

-- AddForeignKey
ALTER TABLE "user_city_visit" ADD CONSTRAINT "user_city_visit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_city_visit" ADD CONSTRAINT "user_city_visit_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "city"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_city_visit" ADD CONSTRAINT "user_city_visit_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "flight"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_city_visit" ADD CONSTRAINT "user_city_visit_airportId_fkey" FOREIGN KEY ("airportId") REFERENCES "airport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Backfill one visit per completed flight, at the city of the airport it landed at.
INSERT INTO "user_city_visit" ("id", "userId", "cityId", "flightId", "airportId", "visitedAt")
SELECT gen_random_uuid(), f."captainId", a."cityId", f."id", a."id", f."completedAt"
FROM "flight" f
JOIN "airport" a ON a."id" = COALESCE(
    CASE WHEN f."isDiversionDeclared" THEN (
        SELECT d."airportId" FROM "flight_diversion" d WHERE d."flightId" = f."id"
    ) END,
    (
        SELECT af."airportId" FROM "airport_flight" af
        WHERE af."flightId" = f."id" AND af."airportType" = 'destination'
    )
)
WHERE f."completedAt" IS NOT NULL
  AND f."captainId" IS NOT NULL
ON CONFLICT ("userId", "flightId") DO NOTHING;
