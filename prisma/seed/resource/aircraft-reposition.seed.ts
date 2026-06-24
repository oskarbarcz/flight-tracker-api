import {
  AircraftRepositionStatus,
  AircraftRepositionType,
} from '../../client/client';
import { PrismaService } from '../../../src/core/provider/prisma/prisma.service';

const prisma = new PrismaService();

const D_AIDA = '7d27a031-5abb-415f-bde5-1aa563ad394e';
const N78881 = 'a10c21e3-3ac1-4265-9d12-da9baefa2d98';

const EDDF = 'f35c094a-bec5-4803-be32-bd80a14b441a';
const KJFK = '3c721cc6-c653-4fad-be43-dc9d6a149383';
const KBOS = 'c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3';
const KPHL = 'e764251b-bb25-4e8b-8cc7-11b0397b4554';

const AAL4913 = '04be266c-df78-4bec-9f50-281cc02ce7f2';

export async function loadAircraftReposition(): Promise<void> {
  await prisma.aircraftReposition.createMany({
    data: [
      {
        // pending leg N78881 is performing on AAL4913 (KBOS -> KPHL);
        // flipped to finished when the flight reports on-block
        id: '7b000000-0000-4000-8000-0000000000b1',
        aircraftId: N78881,
        type: AircraftRepositionType.performing_flight,
        status: AircraftRepositionStatus.pending,
        departureAirportId: KBOS,
        destinationAirportId: KPHL,
        distance: 243,
        flightId: AAL4913,
        createdAt: new Date('2025-01-01 09:00'),
        updatedAt: null,
      },
      {
        id: '7b000000-0000-4000-8000-000000000001',
        aircraftId: D_AIDA,
        type: AircraftRepositionType.dead_head_manual,
        status: AircraftRepositionStatus.finished,
        departureAirportId: EDDF,
        destinationAirportId: KBOS,
        distance: 3000,
        flightId: null,
        createdAt: new Date('2025-01-01 10:00'),
        updatedAt: null,
      },
      {
        id: '7b000000-0000-4000-8000-000000000002',
        aircraftId: D_AIDA,
        type: AircraftRepositionType.dead_head_automatic,
        status: AircraftRepositionStatus.finished,
        departureAirportId: KBOS,
        destinationAirportId: KPHL,
        distance: 243,
        flightId: null,
        createdAt: new Date('2025-01-01 11:00'),
        updatedAt: null,
      },
      {
        id: '7b000000-0000-4000-8000-000000000003',
        aircraftId: D_AIDA,
        type: AircraftRepositionType.performing_flight,
        status: AircraftRepositionStatus.finished,
        departureAirportId: KPHL,
        destinationAirportId: KJFK,
        distance: 80,
        flightId: null,
        createdAt: new Date('2025-01-02 12:00'),
        updatedAt: new Date('2025-01-02 14:00'),
      },
      {
        // pending leg D-AIDA is performing (KJFK -> EDDF);
        // flipped to finished when the flight reports on-block
        id: '7b000000-0000-4000-8000-0000000000a1',
        aircraftId: D_AIDA,
        type: AircraftRepositionType.performing_flight,
        status: AircraftRepositionStatus.pending,
        departureAirportId: KJFK,
        destinationAirportId: EDDF,
        distance: 3342,
        flightId: null,
        createdAt: new Date('2025-01-02 15:00'),
        updatedAt: null,
      },
    ],
  });
}
