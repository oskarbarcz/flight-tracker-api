import { PrismaService } from '../../src/core/provider/prisma/prisma.service';
import { loadResources } from './load-resources';

const prisma = new PrismaService();

loadResources()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Seeding finished successfully.');
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
