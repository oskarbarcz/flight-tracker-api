-- AlterTable
ALTER TABLE "flight"
  ADD COLUMN "isEmergencyDeclared" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "isDiversionDeclared" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "isPathAvailable"     BOOLEAN NOT NULL DEFAULT false;

-- Backfill from existing related rows so reads stay consistent with prior derivation.
UPDATE "flight" f
SET "isEmergencyDeclared" = TRUE
WHERE EXISTS (
  SELECT 1 FROM "flight_emergency" e
  WHERE e."flightId" = f.id AND e."resolvedAt" IS NULL
);

UPDATE "flight" f
SET "isDiversionDeclared" = TRUE
WHERE EXISTS (
  SELECT 1 FROM "flight_diversion" d WHERE d."flightId" = f.id
);

UPDATE "flight"
SET "isPathAvailable" = TRUE
WHERE jsonb_array_length("positionReports") > 0;
