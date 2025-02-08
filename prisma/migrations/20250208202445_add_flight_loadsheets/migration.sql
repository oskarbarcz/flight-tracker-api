-- AlterTable
ALTER TABLE "flight"
    ADD COLUMN "loadsheets" JSONB NOT NULL DEFAULT '{"preliminary":null,"final":null}';
