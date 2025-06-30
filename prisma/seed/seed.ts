import { PrismaClient } from '@prisma/client';
import { loadAircraft } from './resource/aircrafts.seed';
import { loadOperators } from './resource/operators.seed';
import { loadAirports } from './resource/airports.seed';
import { loadFlights } from './resource/flights.seed';
import { loadUsers } from './resource/users.seed';
import { loadRotations } from './resource/rotations.seed';

const prisma = new PrismaClient();

async function main() {
  await loadAirports();
  await loadOperators();
  await loadAircraft();
  await loadFlights();
  await loadUsers();
  await loadRotations();
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
