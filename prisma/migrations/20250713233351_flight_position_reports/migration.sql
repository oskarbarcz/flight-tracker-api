-- AlterTable
ALTER TABLE "flight" ADD COLUMN     "positionReports" JSONB NOT NULL DEFAULT '[]';
