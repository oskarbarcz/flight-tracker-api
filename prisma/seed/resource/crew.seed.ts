import { Prisma } from '../../client/client';
import { CrewRole } from '../../client/client';

export async function loadCrew(tx: Prisma.TransactionClient): Promise<void> {
  await tx.crew.createMany({
    data: [
      {
        id: '22772d9d-5e77-4e6a-9f82-b5329440febe',
        name: 'Piotr Lewandowski',
        email: 'piotr.lewandowski@lot.com',
        // LOT operator
        operatorId: '1d85d597-c3a1-43cf-b888-10d674ea7a46',
        role: CrewRole.fo,
        createdAt: new Date('2025-01-01T00:00:00.000Z'),
      },
      {
        id: '99d37979-dd64-47e2-9517-ebffe3984124',
        name: 'Marek Zielinski',
        email: 'marek.zielinski@lot.com',
        // LOT operator
        operatorId: '1d85d597-c3a1-43cf-b888-10d674ea7a46',
        role: CrewRole.pu,
        createdAt: new Date('2025-01-01T00:00:00.000Z'),
      },
      {
        id: 'f96c4581-a3a5-48c5-a3d0-f628ba05fc22',
        name: 'Anna Nowak',
        email: 'anna.nowak@lot.com',
        // LOT operator
        operatorId: '1d85d597-c3a1-43cf-b888-10d674ea7a46',
        role: CrewRole.fa,
        createdAt: new Date('2025-01-01T00:00:00.000Z'),
      },
      {
        id: '447c5e6d-0e88-4362-ab12-285677d5bbd3',
        name: 'James Carter',
        email: 'james.carter@americanairlines.com',
        // American Airlines operator
        operatorId: '1f630d38-ad24-47cc-950b-3783e71bbd10',
        role: CrewRole.fo,
        createdAt: new Date('2025-01-01T00:00:00.000Z'),
      },
      {
        id: 'f4fde12f-64c6-40a4-9e89-ccca6d652101',
        name: 'Susan Brooks',
        email: 'susan.brooks@americanairlines.com',
        // American Airlines operator
        operatorId: '1f630d38-ad24-47cc-950b-3783e71bbd10',
        role: CrewRole.pu,
        createdAt: new Date('2025-01-01T00:00:00.000Z'),
      },
      {
        id: '6a0ecac2-4771-422b-8de2-5936c2546341',
        name: 'Emily Ross',
        email: 'emily.ross@americanairlines.com',
        // American Airlines operator
        operatorId: '1f630d38-ad24-47cc-950b-3783e71bbd10',
        role: CrewRole.fa,
        createdAt: new Date('2025-01-01T00:00:00.000Z'),
      },
    ],
  });
}

export async function loadFlightCrew(
  tx: Prisma.TransactionClient,
): Promise<void> {
  await tx.crewOnFlights.createMany({
    data: [
      // American Airlines crew on AAL4906 (Ready — before boarding finished)
      {
        crewId: '447c5e6d-0e88-4362-ab12-285677d5bbd3',
        flightId: '23952e79-6b38-49ed-a1db-bd4d9b3cedab',
      },
      {
        crewId: 'f4fde12f-64c6-40a4-9e89-ccca6d652101',
        flightId: '23952e79-6b38-49ed-a1db-bd4d9b3cedab',
      },
      {
        crewId: '6a0ecac2-4771-422b-8de2-5936c2546341',
        flightId: '23952e79-6b38-49ed-a1db-bd4d9b3cedab',
      },
    ],
  });
}
