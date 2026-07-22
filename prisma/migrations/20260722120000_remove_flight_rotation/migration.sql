-- DropForeignKey
ALTER TABLE "flight" DROP CONSTRAINT "flight_rotationId_fkey";

-- DropForeignKey
ALTER TABLE "rotation" DROP CONSTRAINT "rotation_operatorId_fkey";

-- DropForeignKey
ALTER TABLE "rotation" DROP CONSTRAINT "rotation_pilotId_fkey";

-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_currentRotationId_fkey";

-- DropIndex
DROP INDEX "user_currentRotationId_key";

-- AlterTable
ALTER TABLE "flight" DROP COLUMN "rotationId";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "currentRotationId";

-- DropTable
DROP TABLE "rotation";
