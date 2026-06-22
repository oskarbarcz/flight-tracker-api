-- CreateEnum
CREATE TYPE "OperatorAlliance" AS ENUM ('star_alliance', 'sky_team', 'oneworld', 'vanilla_alliance');

-- CreateEnum
CREATE TYPE "OperatorGroup" AS ENUM ('lufthansa_group', 'international_airlines_group', 'air_france_klm', 'ryanair_holdings', 'easyjet_group', 'ana_holdings', 'japan_airlines_group', 'qantas_group', 'singapore_airlines_group', 'alaska_air_group', 'hna_aviation_group', 'china_southern_air_holding', 'china_eastern_air_holding', 'air_china_group', 'korean_air_group', 'turkish_airlines_group', 'emirates_group');

-- AlterTable
ALTER TABLE "operator"
ADD COLUMN  "alliance" "OperatorAlliance",
ADD COLUMN  "group"    "OperatorGroup";
