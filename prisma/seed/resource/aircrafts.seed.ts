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
    lastAirportId: '3c721cc6-c653-4fad-be43-dc9d6a149383', // KJFK
    lastAirportUpdatedAt: new Date('2025-01-02 18:00'),
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
    lastAirportId: '3c721cc6-c653-4fad-be43-dc9d6a149383', // KJFK
    lastAirportUpdatedAt: new Date('2025-01-01 08:00'),
  };

  // One dedicated aircraft per flight fixture, so each flight-status fixture
  // owns its movement/reposition history instead of sharing a330/b773.
  const AAL = '1f630d38-ad24-47cc-950b-3783e71bbd10'; // American Airlines
  const DLH = '40b1b34e-aea1-4cec-acbe-f2bf97c06d7d'; // Lufthansa
  const KJFK = '3c721cc6-c653-4fad-be43-dc9d6a149383';
  const EDDF = 'f35c094a-bec5-4803-be32-bd80a14b441a';
  const lastAirportUpdatedAt = new Date('2025-01-01 08:00');

  const fleet: Aircraft[] = [
    // American — B77W, based KJFK (deadhead KJFK -> KBOS on every checked-in leg)
    {
      id: 'ac000000-0000-4000-8000-000000000001',
      type: 'B77W',
      registration: 'N718AN',
      selcal: 'AB-CD',
      livery: 'Oneworld (2023)',
      operatorId: AAL,
      currentState: AircraftState.idle,
      baseAirportId: KJFK,
      lastAirportId: KJFK,
      lastAirportUpdatedAt,
    },
    {
      id: 'ac000000-0000-4000-8000-000000000002',
      type: 'B77W',
      registration: 'N719AN',
      selcal: 'AB-CE',
      livery: 'Flagship (2022)',
      operatorId: AAL,
      currentState: AircraftState.idle,
      baseAirportId: KJFK,
      lastAirportId: KJFK,
      lastAirportUpdatedAt,
    },
    {
      id: 'ac000000-0000-4000-8000-000000000003',
      type: 'B77W',
      registration: 'N720AN',
      selcal: 'AB-CF',
      livery: 'Astrojet (2021)',
      operatorId: AAL,
      currentState: AircraftState.idle,
      baseAirportId: KJFK,
      lastAirportId: KJFK,
      lastAirportUpdatedAt,
    },
    {
      id: 'ac000000-0000-4000-8000-000000000004',
      type: 'B77W',
      registration: 'N721AN',
      selcal: 'AB-CG',
      livery: 'Polished (2019)',
      operatorId: AAL,
      currentState: AircraftState.idle,
      baseAirportId: KJFK,
      lastAirportId: KJFK,
      lastAirportUpdatedAt,
    },
    {
      id: 'ac000000-0000-4000-8000-000000000005',
      type: 'B77W',
      registration: 'N722AN',
      selcal: 'AB-DE',
      livery: 'Standard (2020)',
      operatorId: AAL,
      currentState: AircraftState.idle,
      baseAirportId: KJFK,
      lastAirportId: KJFK,
      lastAirportUpdatedAt,
    },
    {
      id: 'ac000000-0000-4000-8000-000000000006',
      type: 'B77W',
      registration: 'N723AN',
      selcal: 'AB-DF',
      livery: 'AAdvantage (2022)',
      operatorId: AAL,
      currentState: AircraftState.idle,
      baseAirportId: KJFK,
      lastAirportId: KJFK,
      lastAirportUpdatedAt,
    },
    {
      id: 'ac000000-0000-4000-8000-000000000007',
      type: 'B77W',
      registration: 'N724AN',
      selcal: 'AB-DG',
      livery: 'Heritage TWA (2019)',
      operatorId: AAL,
      currentState: AircraftState.idle,
      baseAirportId: KJFK,
      lastAirportId: KJFK,
      lastAirportUpdatedAt,
    },
    {
      id: 'ac000000-0000-4000-8000-000000000008',
      type: 'B77W',
      registration: 'N725AN',
      selcal: 'AB-EF',
      livery: 'Heritage US Airways (2020)',
      operatorId: AAL,
      currentState: AircraftState.idle,
      baseAirportId: KJFK,
      lastAirportId: KJFK,
      lastAirportUpdatedAt,
    },
    {
      id: 'ac000000-0000-4000-8000-000000000009',
      type: 'B77W',
      registration: 'N726AN',
      selcal: 'AB-EG',
      livery: 'Heritage Reno Air (2021)',
      operatorId: AAL,
      currentState: AircraftState.idle,
      baseAirportId: KJFK,
      lastAirportId: KJFK,
      lastAirportUpdatedAt,
    },
    {
      id: 'ac000000-0000-4000-8000-000000000010',
      type: 'B77W',
      registration: 'N727AN',
      selcal: 'AB-FG',
      livery: 'Heritage America West (2022)',
      operatorId: AAL,
      currentState: AircraftState.idle,
      baseAirportId: KJFK,
      lastAirportId: KJFK,
      lastAirportUpdatedAt,
    },
    {
      id: 'ac000000-0000-4000-8000-000000000011',
      type: 'B77W',
      registration: 'N728AN',
      selcal: 'AC-DE',
      livery: 'Stand Up To Cancer (2023)',
      operatorId: AAL,
      currentState: AircraftState.idle,
      baseAirportId: KJFK,
      lastAirportId: KJFK,
      lastAirportUpdatedAt,
    },
    {
      id: 'ac000000-0000-4000-8000-000000000012',
      type: 'B77W',
      registration: 'N729AN',
      selcal: 'AC-DF',
      livery: 'Breast Cancer Awareness (2022)',
      operatorId: AAL,
      currentState: AircraftState.idle,
      baseAirportId: KJFK,
      lastAirportId: KJFK,
      lastAirportUpdatedAt,
    },
    {
      id: 'ac000000-0000-4000-8000-000000000013',
      type: 'B77W',
      registration: 'N730AN',
      selcal: 'AC-DG',
      livery: '50th Anniversary (2024)',
      operatorId: AAL,
      currentState: AircraftState.idle,
      baseAirportId: KJFK,
      lastAirportId: KJFK,
      lastAirportUpdatedAt,
    },
    // Lufthansa — A339, based EDDF (deadhead only on KJFK-origin return legs)
    {
      id: 'ac000000-0000-4000-8000-000000000014',
      type: 'A339',
      registration: 'D-AIMD',
      selcal: 'BD-EF',
      livery: 'Star Alliance (2023)',
      operatorId: DLH,
      currentState: AircraftState.idle,
      baseAirportId: EDDF,
      lastAirportId: EDDF,
      lastAirportUpdatedAt,
    },
    {
      id: 'ac000000-0000-4000-8000-000000000015',
      type: 'A339',
      registration: 'D-AIME',
      selcal: 'BD-EG',
      livery: 'Lovehansa (2024)',
      operatorId: DLH,
      currentState: AircraftState.idle,
      baseAirportId: EDDF,
      lastAirportId: EDDF,
      lastAirportUpdatedAt,
    },
    {
      id: 'ac000000-0000-4000-8000-000000000016',
      type: 'A339',
      registration: 'D-AIMF',
      selcal: 'BD-FG',
      livery: 'New Livery (2018)',
      operatorId: DLH,
      currentState: AircraftState.idle,
      baseAirportId: EDDF,
      lastAirportId: EDDF,
      lastAirportUpdatedAt,
    },
    {
      id: 'ac000000-0000-4000-8000-000000000017',
      type: 'A339',
      registration: 'D-AIMG',
      selcal: 'BE-FG',
      livery: 'Retro 1970s (2022)',
      operatorId: DLH,
      currentState: AircraftState.idle,
      baseAirportId: EDDF,
      lastAirportId: EDDF,
      lastAirportUpdatedAt,
    },
    {
      id: 'ac000000-0000-4000-8000-000000000018',
      type: 'A339',
      registration: 'D-AIMH',
      selcal: 'CD-EF',
      livery: 'Siegerflieger (2023)',
      operatorId: DLH,
      currentState: AircraftState.idle,
      baseAirportId: EDDF,
      lastAirportId: EDDF,
      lastAirportUpdatedAt,
    },
    {
      id: 'ac000000-0000-4000-8000-000000000019',
      type: 'A339',
      registration: 'D-AIMK',
      selcal: 'CD-EG',
      livery: 'Cheers to 70 Years (2025)',
      operatorId: DLH,
      currentState: AircraftState.idle,
      baseAirportId: EDDF,
      lastAirportId: EDDF,
      lastAirportUpdatedAt,
    },
    {
      id: 'ac000000-0000-4000-8000-000000000020',
      type: 'A339',
      registration: 'D-AIML',
      selcal: 'CE-FG',
      livery: 'Munich (2024)',
      operatorId: DLH,
      currentState: AircraftState.idle,
      baseAirportId: EDDF,
      lastAirportId: EDDF,
      lastAirportUpdatedAt,
    },
  ];

  const prisma = new PrismaService();
  for (const aircraft of [a330, a321, a319, b773, ...fleet]) {
    await prisma.aircraft.create({ data: aircraft });
  }
}
