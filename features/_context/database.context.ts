import { AfterAll, BeforeAll, Then } from '@cucumber/cucumber';
import { PrismaService } from '../../src/core/provider/prisma/prisma.service';
import { loadResources } from '../../prisma/seed/load-resources';

const prisma = new PrismaService();

const RESET_TIMEOUT_MS = 30_000;
const SNAPSHOT_SCHEMA = 'seed_snapshot';
const RESET_ATTEMPTS = 5;
const RESET_RETRY_DELAY_MS = 100;

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
      PERFORM set_config('lock_timeout', '5s', true);

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

const isDeadlock = (error: unknown): boolean =>
  JSON.stringify(error instanceof Error ? error.message : error).includes(
    'deadlock detected',
  );

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// The application is running while the suite resets the database, so its own transactions can
// hold locks on tables the restore is truncating. Postgres resolves the resulting deadlock by
// killing one side, and it is the restore that loses often enough to matter. Retrying is enough:
// the request that caused the contention has finished by the time the restore comes round again.
const resetDatabase = async (): Promise<void> => {
  for (let attempt = 1; attempt <= RESET_ATTEMPTS; attempt++) {
    try {
      await restoreSnapshot();

      return;
    } catch (error) {
      if (!isDeadlock(error) || attempt === RESET_ATTEMPTS) {
        console.error(error);
        throw error;
      }

      await wait(RESET_RETRY_DELAY_MS * attempt);
    }
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
