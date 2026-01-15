import { loadAircraft } from './resource/aircrafts.seed';
import { loadOperators } from './resource/operators.seed';
import { loadAirports } from './resource/airports.seed';
import { loadFlights } from './resource/flights.seed';
import { loadUsers } from './resource/users.seed';
import { loadRotations } from './resource/rotations.seed';
import { PrismaService } from '../../src/core/provider/prisma/prisma.service';

const prisma = new PrismaService();

async function main() {
  await loadAirports();
  await loadOperators();
  await loadAircraft();
  await loadUsers();
  await loadRotations();
  await loadFlights();
}

main()
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
