import { AfterAll, BeforeAll, Then } from '@cucumber/cucumber';
import { execSync } from 'child_process';
import { PrismaService } from '../../src/core/provider/prisma/prisma.service';
import { loadResources } from '../../prisma/seed/load-resources';

const prisma = new PrismaService();

// Reset the database before running tests
BeforeAll(() => {
  execSync('npx prisma migrate reset --force && npx prisma db seed', {
    stdio: 'ignore',
  });
});

// Reset the database after running tests
AfterAll(() => {
  execSync('npx prisma migrate reset --force && npx prisma db seed', {
    stdio: 'ignore',
  });
});

Then('I set database to initial state', async () => {
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== '_prisma_migrations')
    .map((name) => `"public"."${name}"`)
    .join(', ');

  try {
    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE;`,
    );

    await loadResources();
  } catch (error) {
    console.error(error);
    throw error;
  }
});
