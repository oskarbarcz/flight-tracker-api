import { AfterAll, BeforeAll, Then } from '@cucumber/cucumber';
import { PrismaService } from '../../src/core/provider/prisma/prisma.service';
import { loadResources } from '../../prisma/seed/load-resources';

const prisma = new PrismaService();

const resetDatabase = async () => {
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
};

BeforeAll(async () => {
  await resetDatabase();
});

AfterAll(async () => {
  await resetDatabase();
});

Then('I set database to initial state', async () => {
  await resetDatabase();
});
