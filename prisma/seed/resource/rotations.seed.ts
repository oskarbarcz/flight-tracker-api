import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function loadRotations() {
  await prisma.rotation.create({
    data: {
      id: 'bd8f2d64-a647-42da-be63-c6589915e6c9',
      name: 'Morning Shift',
      // Rick Doe user
      pilotId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
    },
  });
}
