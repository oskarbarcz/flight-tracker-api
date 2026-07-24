-- AlterTable
ALTER TABLE "flight" ADD COLUMN     "actualAirborneMinutes" INTEGER,
ADD COLUMN     "actualBlockMinutes" INTEGER,
ADD COLUMN     "completedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "user" DROP COLUMN "totalFlightTime",
DROP COLUMN "totalFuelBurned",
DROP COLUMN "totalGreatCircleDistance";

-- CreateTable
CREATE TABLE "user_stats_total" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "flights" INTEGER NOT NULL DEFAULT 0,
    "distanceNm" INTEGER NOT NULL DEFAULT 0,
    "airborneMinutes" INTEGER NOT NULL DEFAULT 0,
    "blockMinutes" INTEGER NOT NULL DEFAULT 0,
    "fuelBurned" INTEGER NOT NULL DEFAULT 0,
    "longestFlightDistanceNm" INTEGER NOT NULL DEFAULT 0,
    "longestFlightMinutes" INTEGER NOT NULL DEFAULT 0,
    "firstFlightAt" TIMESTAMP(3),
    "lastFlightAt" TIMESTAMP(3),
    "mostFlownOperatorId" UUID,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "user_stats_total_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_stats_by_type" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" VARCHAR(4) NOT NULL,
    "flights" INTEGER NOT NULL DEFAULT 0,
    "distanceNm" INTEGER NOT NULL DEFAULT 0,
    "airborneMinutes" INTEGER NOT NULL DEFAULT 0,
    "blockMinutes" INTEGER NOT NULL DEFAULT 0,
    "firstFlownAt" TIMESTAMP(3),
    "lastFlownAt" TIMESTAMP(3),

    CONSTRAINT "user_stats_by_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_stats_by_airport" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "airportId" UUID NOT NULL,
    "icaoCode" VARCHAR(4) NOT NULL,
    "country" TEXT NOT NULL,
    "continent" "Continent" NOT NULL,
    "visits" INTEGER NOT NULL DEFAULT 0,
    "firstVisitAt" TIMESTAMP(3),
    "lastVisitAt" TIMESTAMP(3),

    CONSTRAINT "user_stats_by_airport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_stats_daily" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "day" DATE NOT NULL,
    "flights" INTEGER NOT NULL DEFAULT 0,
    "distanceNm" INTEGER NOT NULL DEFAULT 0,
    "airborneMinutes" INTEGER NOT NULL DEFAULT 0,
    "blockMinutes" INTEGER NOT NULL DEFAULT 0,
    "fuelBurned" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_stats_daily_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_stats_total_userId_key" ON "user_stats_total"("userId");

-- CreateIndex
CREATE INDEX "user_stats_by_type_userId_idx" ON "user_stats_by_type"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_stats_by_type_userId_type_key" ON "user_stats_by_type"("userId", "type");

-- CreateIndex
CREATE INDEX "user_stats_by_airport_userId_idx" ON "user_stats_by_airport"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_stats_by_airport_userId_airportId_key" ON "user_stats_by_airport"("userId", "airportId");

-- CreateIndex
CREATE INDEX "user_stats_daily_userId_idx" ON "user_stats_daily"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_stats_daily_userId_day_key" ON "user_stats_daily"("userId", "day");

-- CreateIndex
CREATE INDEX "flight_captainId_completedAt_idx" ON "flight"("captainId", "completedAt");

-- AddForeignKey
ALTER TABLE "user_stats_total" ADD CONSTRAINT "user_stats_total_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_stats_by_type" ADD CONSTRAINT "user_stats_by_type_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_stats_by_airport" ADD CONSTRAINT "user_stats_by_airport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_stats_daily" ADD CONSTRAINT "user_stats_daily_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
