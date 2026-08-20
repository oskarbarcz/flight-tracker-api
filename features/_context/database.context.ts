import { AfterAll, BeforeAll, Then } from '@cucumber/cucumber';
import { PrismaService } from '../../src/core/provider/prisma/prisma.service';
import { loadResources } from '../../prisma/seed/load-resources';

const prisma = new PrismaService();

const RESET_TIMEOUT_MS = 30_000;
const SNAPSHOT_SCHEMA = 'seed_snapshot';

let seededTables: string[] | null = null;

const tables = async (): Promise<string[]> => {
  if (seededTables) {
    return seededTables;
  }

  const rows = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  `;

  seededTables = rows
    .map(({ tablename }) => tablename)
    .filter((name) => name !== '_prisma_migrations');

  return seededTables;
};

const quoted = (names: string[], schema: string): string =>
  names.map((name) => `"${schema}"."${name}"`).join(', ');

const seedFromScratch = async (): Promise<void> => {
  const names = await tables();

  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${quoted(names, 'public')} CASCADE;`,
  );
  await loadResources();
};

const captureSnapshot = async (): Promise<void> => {
  const names = await tables();

  await prisma.$executeRawUnsafe(
    `DROP SCHEMA IF EXISTS "${SNAPSHOT_SCHEMA}" CASCADE;`,
  );
  await prisma.$executeRawUnsafe(`CREATE SCHEMA "${SNAPSHOT_SCHEMA}";`);

  for (const name of names) {
    await prisma.$executeRawUnsafe(
      `CREATE TABLE "${SNAPSHOT_SCHEMA}"."${name}" AS TABLE "public"."${name}";`,
    );
  }
};

const restoreSnapshot = async (): Promise<void> => {
  await prisma.$executeRawUnsafe(`
    DO $$
    DECLARE
      relation text;
      targets text;
    BEGIN
      PERFORM set_config('session_replication_role', 'replica', true);

      SELECT string_agg(format('public.%I', tablename), ', ')
        INTO targets
        FROM pg_tables
       WHERE schemaname = '${SNAPSHOT_SCHEMA}';

      EXECUTE format('TRUNCATE TABLE %s CASCADE', targets);

      FOR relation IN
        SELECT tablename FROM pg_tables WHERE schemaname = '${SNAPSHOT_SCHEMA}'
      LOOP
        EXECUTE format(
          'INSERT INTO public.%I SELECT * FROM ${SNAPSHOT_SCHEMA}.%I',
          relation,
          relation
        );
      END LOOP;
    END $$;
  `);
};

const resetDatabase = async (): Promise<void> => {
  try {
    await restoreSnapshot();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

BeforeAll({ timeout: RESET_TIMEOUT_MS }, async () => {
  await seedFromScratch();
  await captureSnapshot();
});

AfterAll({ timeout: RESET_TIMEOUT_MS }, async () => {
  await resetDatabase();
  await prisma.$executeRawUnsafe(
    `DROP SCHEMA IF EXISTS "${SNAPSHOT_SCHEMA}" CASCADE;`,
  );
});

Then(
  'I set database to initial state',
  { timeout: RESET_TIMEOUT_MS },
  async () => {
    await resetDatabase();
  },
);
