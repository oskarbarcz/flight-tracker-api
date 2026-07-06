import { PrismaService } from '../../../src/core/provider/prisma/prisma.service';

const prisma = new PrismaService();

const RICK = 'fcf6f4bc-290d-43a9-843c-409cd47e143d';

// Aircraft Rick captained (see aircrafts.seed.ts / flights.seed.ts)
const N718AN_B77W = '6c48d613-6582-49de-afbb-89fdc7cac0b7';
const DAIMF_A339 = 'a9b9205d-53b1-4eec-bb24-548a12159997';
const DAIMG_A339 = 'ed7ed4bb-95ff-4e79-9331-11212ef727ec';

// Flights Rick captained
const AAL4905 = '23da8bc9-a21b-4678-b2e9-1151d3bd15ab'; // American Airlines
const DLH43 = 'd4a25ef2-39cf-484c-af00-a548999e8699'; // Lufthansa
const DLH102 = '1e9f4176-188f-41a5-a9d1-25a96579f46d'; // Lufthansa

export async function loadUserAircraft(): Promise<void> {
  await prisma.userAircraft.createMany({
    data: [
      {
        id: 'c0958a49-b1c2-4cb4-b567-69afe9d17d21',
        userId: RICK,
        aircraftId: N718AN_B77W,
        flightId: AAL4905,
        createdAt: new Date('2025-01-05 12:00'),
      },
      {
        id: 'e04e0325-f3ac-47f7-9701-3880db8a1bee',
        userId: RICK,
        aircraftId: DAIMF_A339,
        flightId: DLH43,
        createdAt: new Date('2025-01-06 12:00'),
      },
      {
        id: '74ed25fc-51fd-4b0b-8ee0-af97a8f7e88f',
        userId: RICK,
        aircraftId: DAIMG_A339,
        flightId: DLH102,
        createdAt: new Date('2025-01-07 12:00'),
      },
    ],
  });
}
