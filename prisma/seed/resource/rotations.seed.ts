import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function loadRotations(): Promise<void> {
  await prisma.rotation.create({
    data: {
      id: 'bd8f2d64-a647-42da-be63-c6589915e6c9',
      name: '2025-01',
      // Rick Doe user
      pilotId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
    },
  });

  await prisma.rotation.create({
    data: {
      id: '4cb9b5a8-7cac-4526-a0f7-f158fd14e9d1',
      name: '2025-02',
      // Alan Doe user
      pilotId: '725f5df2-0c78-4fe8-89a2-52566c89cf7f',
      createdAt: new Date('2025-01-02T00:00:00.000Z'),
    },
  });

  await prisma.user.update({
    where: { id: '725f5df2-0c78-4fe8-89a2-52566c89cf7f' }, // Alan Doe user
    data: {
      currentRotationId: '4cb9b5a8-7cac-4526-a0f7-f158fd14e9d1',
    },
  });
}
