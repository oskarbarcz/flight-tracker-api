import { Prisma } from '../../client/client';
import { PrismaService } from '../../../src/core/provider/prisma/prisma.service';

export async function loadGates(): Promise<void> {
  const frankfurtT1Gate1: Prisma.GateCreateManyInput = {
    id: '4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101',
    airportId: 'f35c094a-bec5-4803-be32-bd80a14b441a',
    terminalId: 'd7fd7a84-1589-4a4f-9072-a9773f66e2b5',
    name: 'A10',
    bridge: 'yes',
    stairs: 'no',
    deicing: 'possible',
    gpu: 'bridge',
    pca: 'bridge',
    parkingPositionType: 'straight-in',
    parkingSpotType: 'passenger',
    parkingAssistance: 'vdgs',
    location: 'gate',
    noiseSensitivity: 'no',
    fuelingOptions: 'hydrant',
  };

  const frankfurtT1Gate2: Prisma.GateCreateManyInput = {
    id: '4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2102',
    airportId: 'f35c094a-bec5-4803-be32-bd80a14b441a',
    terminalId: 'd7fd7a84-1589-4a4f-9072-a9773f66e2b5',
    name: 'A11',
    bridge: 'no',
    stairs: 'with-bus-transport',
    deicing: 'no',
    gpu: 'standalone',
    pca: 'no',
    parkingPositionType: 'angled',
    parkingSpotType: 'passenger',
    parkingAssistance: 'marshaller',
    location: 'remote',
    noiseSensitivity: 'yes',
    noiseSensitivityText:
      'Night curfew: no engine runs or pushbacks permitted.',
    noiseSensitivityStartTime: '21:00',
    noiseSensitivityEndTime: '05:00',
    fuelingOptions: 'truck',
  };

  const frankfurtT2Gate1: Prisma.GateCreateManyInput = {
    id: '4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2201',
    airportId: 'f35c094a-bec5-4803-be32-bd80a14b441a',
    terminalId: '26106c8a-aaee-4b84-bb6c-b5af3389e22f',
    name: 'B5',
    bridge: 'yes',
    stairs: 'no',
    deicing: 'mandatory',
    deicingDescription:
      'Deicing pad shared with stand B6. Coordinate with ground ops.',
    gpu: 'both',
    pca: 'both',
    parkingPositionType: 'straight-in-taxi-through',
    parkingSpotType: 'passenger',
    parkingAssistance: 'vdgs-or-marshaller',
    location: 'gate',
    noiseSensitivity: 'no',
    fuelingOptions: 'hydrant',
  };

  const prisma = new PrismaService();

  await prisma.gate.createMany({
    data: [frankfurtT1Gate1, frankfurtT1Gate2, frankfurtT2Gate1],
  });
}
