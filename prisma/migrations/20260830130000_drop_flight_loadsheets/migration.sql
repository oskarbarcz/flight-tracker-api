-- AlterTable. The check and the drop share one statement so that no client can carry on past a
-- refusal: applying this straight after the previous migration, on an environment where the
-- loadsheets were never copied across, must not lose them.
DO $$
DECLARE stored bigint;
BEGIN
    SELECT count(*) INTO stored
    FROM "flight" f
    CROSS JOIN (VALUES ('preliminary'), ('final')) AS k(kind)
    WHERE jsonb_typeof(f."loadsheets" -> k.kind) = 'object';

    IF stored > 0 AND NOT EXISTS (SELECT 1 FROM "flight_loadsheet") THEN
        RAISE EXCEPTION
            'flight.loadsheets holds % stored loadsheets and flight_loadsheet is empty; copy them across before dropping the column', stored;
    END IF;

    EXECUTE 'ALTER TABLE "flight" DROP COLUMN "loadsheets"';
END $$;
