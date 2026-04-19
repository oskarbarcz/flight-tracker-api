import { Prisma } from '../../client/client';
import { PrismaService } from '../../../src/core/provider/prisma/prisma.service';

export async function loadTerminals(): Promise<void> {
  const frankfurtT1: Prisma.TerminalCreateManyInput = {
    id: 'd7fd7a84-1589-4a4f-9072-a9773f66e2b5',
    airportId: 'f35c094a-bec5-4803-be32-bd80a14b441a',
    shortName: 'T1',
    fullName: 'Terminal 1',
    averageTaxiTime: 12,
    operatorCodes: ['DLH', 'LOT'],
  };

  const frankfurtT2: Prisma.TerminalCreateManyInput = {
    id: '26106c8a-aaee-4b84-bb6c-b5af3389e22f',
    airportId: 'f35c094a-bec5-4803-be32-bd80a14b441a',
    shortName: 'T2',
    fullName: 'Terminal 2',
    averageTaxiTime: 14,
    operatorCodes: ['BAW', 'AFR'],
  };

  const warsawT1: Prisma.TerminalCreateManyInput = {
    id: '104014ec-110e-483d-9f3c-8f6909fe4823',
    airportId: '616cbdd7-ccfc-4687-8cf6-1e7236435046',
    shortName: 'TA',
    fullName: 'Terminal A',
    averageTaxiTime: 9,
    operatorCodes: ['LOT'],
  };

  const prisma = new PrismaService();

  await prisma.terminal.createMany({
    data: [frankfurtT1, frankfurtT2, warsawT1],
  });
}
