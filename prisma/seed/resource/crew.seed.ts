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
    ],
  });
}
