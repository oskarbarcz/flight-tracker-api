import { PrismaClient } from '@prisma/client';
import { loadAircraft } from './resource/aircrafts.seed';
import { loadOperators } from './resource/operators.seed';
import { loadAirports } from './resource/airports.seed';
import { loadFlights } from './resource/flights.seed';

const prisma = new PrismaClient();

async function main() {
  await loadAirports(prisma);
  await loadOperators(prisma);
  await loadAircraft(prisma);
  await loadFlights(prisma);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
