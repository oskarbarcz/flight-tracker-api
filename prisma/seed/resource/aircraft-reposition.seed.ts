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

  // Per-flight aircraft (one aircraft per fixture). Each leg mirrors what
  // RepositionFlightLifecycleListener would record: a dead_head_automatic from
  // the aircraft base to the flight departure (only when they differ), followed
  // by the performing_flight leg (pending until the flight reports on-block).
  const CDG = '79b8f884-f67d-4585-b540-36b0be7f551e';
  const ci = new Date('2025-01-01 12:00');
  const ob18 = new Date('2025-01-01 16:18');
  const ob28 = new Date('2025-01-01 16:28');

  type Leg = {
    suffix: string;
    flightId: string;
    deadhead?: { from: string; to: string; distance: number };
    performing: {
      from: string;
      to: string;
      distance: number;
      finished: boolean;
      createdAt: Date;
      updatedAt: Date | null;
    };
  };

  const dh = (from: string, to: string, distance: number) => ({
    from,
    to,
    distance,
  });

  const legs: Leg[] = [
    // American — based KJFK, deadhead KJFK -> KBOS (162) before each KBOS -> KPHL (243) leg
    {
      suffix: '01',
      flightId: '23da8bc9-a21b-4678-b2e9-1151d3bd15ab',
      deadhead: dh(KJFK, KBOS, 162),
      performing: {
        from: KBOS,
        to: KPHL,
        distance: 243,
        finished: true,
        createdAt: ci,
        updatedAt: ob18,
      },
    }, // AAL4905 Closed
    {
      suffix: '03',
      flightId: 'b3899775-278e-4496-add1-21385a13d93e',
      deadhead: dh(KJFK, KBOS, 162),
      performing: {
        from: KBOS,
        to: KPHL,
        distance: 243,
        finished: false,
        createdAt: ci,
        updatedAt: null,
      },
    }, // AAL4908 CheckedIn
    {
      suffix: '04',
      flightId: '05986dd3-ff01-4112-ad35-ecd85db05c77',
      deadhead: dh(KJFK, KBOS, 162),
      performing: {
        from: KBOS,
        to: KPHL,
        distance: 243,
        finished: false,
        createdAt: ci,
        updatedAt: null,
      },
    }, // AAL4909 BoardingStarted
    {
      suffix: '05',
      flightId: 'f14a2141-4737-4622-a387-40513ff3baf1',
      deadhead: dh(KJFK, KBOS, 162),
      performing: {
        from: KBOS,
        to: KPHL,
        distance: 243,
        finished: false,
        createdAt: ci,
        updatedAt: null,
      },
    }, // AAL4910 BoardingFinished
    {
      suffix: '06',
      flightId: '7105891a-8008-4b47-b473-c81c97615ad7',
      deadhead: dh(KJFK, KBOS, 162),
      performing: {
        from: KBOS,
        to: KPHL,
        distance: 243,
        finished: false,
        createdAt: ci,
        updatedAt: null,
      },
    }, // AAL4911 TaxiingOut
    {
      suffix: '07',
      flightId: '2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d',
      deadhead: dh(KJFK, KBOS, 162),
      performing: {
        from: KBOS,
        to: KPHL,
        distance: 243,
        finished: false,
        createdAt: ci,
        updatedAt: null,
      },
    }, // AAL4912 InCruise
    {
      suffix: '08',
      flightId: '17d2f703-957d-4ad1-a620-3c187a70c26a',
      deadhead: dh(KJFK, KBOS, 162),
      performing: {
        from: KBOS,
        to: KPHL,
        distance: 243,
        finished: true,
        createdAt: ci,
        updatedAt: ob28,
      },
    }, // AAL4914 OnBlock
    {
      suffix: '09',
      flightId: '5aada8ba-60c1-4e93-bcee-b59a7c555fdd',
      deadhead: dh(KJFK, KBOS, 162),
      performing: {
        from: KBOS,
        to: KPHL,
        distance: 243,
        finished: true,
        createdAt: ci,
        updatedAt: ob28,
      },
    }, // AAL4915 OffboardingStarted
    {
      suffix: '10',
      flightId: '38644393-deee-434d-bfd1-7242abdbc4e1',
      deadhead: dh(KJFK, KBOS, 162),
      performing: {
        from: KBOS,
        to: KPHL,
        distance: 243,
        finished: true,
        createdAt: ci,
        updatedAt: ob28,
      },
    }, // AAL4916 OffboardingFinished
    {
      suffix: '11',
      flightId: 'd085c107-308d-48e6-9c93-beca6552a8a3',
      deadhead: dh(KJFK, KBOS, 162),
      performing: {
        from: KBOS,
        to: KPHL,
        distance: 243,
        finished: true,
        createdAt: ci,
        updatedAt: ob28,
      },
    }, // AAL4917 Closed
    {
      suffix: '12',
      flightId: '5f2c6e3d-9b4a-4d18-8e72-1a3c9f5b8d04',
      deadhead: dh(KJFK, KBOS, 162),
      performing: {
        from: KBOS,
        to: KPHL,
        distance: 243,
        finished: true,
        createdAt: ci,
        updatedAt: ob28,
      },
    }, // AAL4918 OffboardingFinished
    {
      suffix: '13',
      flightId: '7d8a3c91-5e62-4b41-9c08-2f6b1d7e3a45',
      deadhead: dh(KJFK, KBOS, 162),
      performing: {
        from: KBOS,
        to: KPHL,
        distance: 243,
        finished: true,
        createdAt: ci,
        updatedAt: ob28,
      },
    }, // AAL4919 OffboardingFinished
    // Lufthansa — based EDDF; deadhead only on KJFK-origin return legs
    {
      suffix: '14',
      flightId: '48760636-9520-4863-b32f-f3618556feb7',
      performing: {
        from: EDDF,
        to: KJFK,
        distance: 3342,
        finished: true,
        createdAt: new Date('2025-01-01 17:45'),
        updatedAt: new Date('2025-01-02 02:45'),
      },
    }, // DLH40 Closed
    {
      suffix: '16',
      flightId: 'd4a25ef2-39cf-484c-af00-a548999e8699',
      deadhead: dh(EDDF, KJFK, 3342),
      performing: {
        from: KJFK,
        to: EDDF,
        distance: 3342,
        finished: true,
        createdAt: ci,
        updatedAt: ob28,
      },
    }, // DLH43 OffboardingFinished
    {
      suffix: '17',
      flightId: '1e9f4176-188f-41a5-a9d1-25a96579f46d',
      deadhead: dh(EDDF, KJFK, 3342),
      performing: {
        from: KJFK,
        to: EDDF,
        distance: 3342,
        finished: false,
        createdAt: ci,
        updatedAt: null,
      },
    }, // DLH102 InCruise
    {
      suffix: '18',
      flightId: 'd5e8f1a2-3b4c-4d5e-9f6a-7b8c9d0e1f2a',
      performing: {
        from: EDDF,
        to: KJFK,
        distance: 3342,
        finished: false,
        createdAt: new Date('2025-01-01 13:10'),
        updatedAt: null,
      },
    }, // DLH103 TaxiingIn
    {
      suffix: '20',
      flightId: 'b88f1c0d-3a55-4ce0-9f7b-1c2d3e4f5a6b',
      performing: {
        from: EDDF,
        to: CDG,
        distance: 243,
        finished: false,
        createdAt: new Date('2025-01-01 08:30'),
        updatedAt: null,
      },
    }, // DLH880 InCruise
  ];

  const generated = legs.flatMap((leg) => {
    const aircraftId = `ac000000-0000-4000-8000-0000000000${leg.suffix}`;
    const records = [];

    if (leg.deadhead) {
      records.push({
        id: `7b000000-0000-4000-8000-0200000000${leg.suffix}`,
        aircraftId,
        type: AircraftRepositionType.dead_head_automatic,
        status: AircraftRepositionStatus.finished,
        departureAirportId: leg.deadhead.from,
        destinationAirportId: leg.deadhead.to,
        distance: leg.deadhead.distance,
        flightId: leg.flightId,
        createdAt: leg.performing.createdAt,
        updatedAt: null,
      });
    }

    records.push({
      id: `7b000000-0000-4000-8000-0100000000${leg.suffix}`,
      aircraftId,
      type: AircraftRepositionType.performing_flight,
      status: leg.performing.finished
        ? AircraftRepositionStatus.finished
        : AircraftRepositionStatus.pending,
      departureAirportId: leg.performing.from,
      destinationAirportId: leg.performing.to,
      distance: leg.performing.distance,
      flightId: leg.flightId,
      createdAt: leg.performing.createdAt,
      updatedAt: leg.performing.updatedAt,
    });

    return records;
  });

  await prisma.aircraftReposition.createMany({ data: generated });
}
