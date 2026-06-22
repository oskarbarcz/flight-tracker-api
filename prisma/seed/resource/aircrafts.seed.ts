import { Aircraft, AircraftState } from '../../client/client';
import { PrismaService } from '../../../src/core/provider/prisma/prisma.service';

export async function loadAircraft(): Promise<void> {
  const a330: Aircraft = {
    id: '9f5da1a4-f09e-4961-8299-82d688337d1f',
    type: 'A339',
    registration: 'D-AIMC',
    selcal: 'LR-CK',
    livery: 'Fanhansa (2024)',
    operatorId: '40b1b34e-aea1-4cec-acbe-f2bf97c06d7d', // Lufthansa
    currentState: AircraftState.idle,
    baseAirportId: 'f35c094a-bec5-4803-be32-bd80a14b441a', // EDDF
    lastAirportId: null,
    lastAirportUpdatedAt: null,
  };

  const a321: Aircraft = {
    id: '7d27a031-5abb-415f-bde5-1aa563ad394e',
    type: 'A321',
    registration: 'D-AIDA',
    selcal: 'SK-PK',
    livery: 'Sunshine (2024)',
    operatorId: '5c649579-22eb-4c07-a96c-b74a77f53871', // Condor
    currentState: AircraftState.idle,
    baseAirportId: 'f35c094a-bec5-4803-be32-bd80a14b441a', // EDDF
    lastAirportId: null,
    lastAirportUpdatedAt: null,
  };

  const a319: Aircraft = {
    id: '3f34bc59-c9c3-4ad0-88fa-2cc570298602',
    type: 'A319',
    registration: 'D-AIDK',
    selcal: 'MS-KL',
    livery: 'Water (2024)',
    operatorId: '5c649579-22eb-4c07-a96c-b74a77f53871', // Condor
    currentState: AircraftState.idle,
    baseAirportId: '5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf', // EDDW
    lastAirportId: null,
    lastAirportUpdatedAt: null,
  };

  const b773: Aircraft = {
    id: 'a10c21e3-3ac1-4265-9d12-da9baefa2d98',
    type: 'B77W',
    registration: 'N78881',
    selcal: 'KY-JO',
    livery: 'Team USA (2023)',
    operatorId: '1f630d38-ad24-47cc-950b-3783e71bbd10', // American Airlines
    currentState: AircraftState.idle,
    baseAirportId: '3c721cc6-c653-4fad-be43-dc9d6a149383', // KJFK
    lastAirportId: null,
    lastAirportUpdatedAt: null,
  };

  const prisma = new PrismaService();
  for (const aircraft of [a330, a321, a319, b773]) {
    await prisma.aircraft.create({ data: aircraft });
  }
}
