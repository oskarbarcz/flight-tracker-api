import { Prisma } from '../../client/client';

const DLH82 = '6d1a7c4b-95e2-4f38-b7a0-c3e8f1d24a56';

const DLH82_ROUTE =
  'TOBAK1C TOBAK UZ29 SPI UL607 LAMSO UN57 DIGBY UN546 LAPEX NATA JANJO DCT HOIST';

type SeededRouteFix = {
  ident: string;
  posLat: number;
  posLong: number;
  altitude: number;
  elapsedSeconds: number;
  distanceNm: number;
  trackTrue: number;
  trackMag: number;
  viaAirway: string;
  stage: string;
};

const DLH82_FIXES: SeededRouteFix[] = [
  {
    ident: 'EDDF',
    posLat: 50.04693,
    posLong: 8.57397,
    altitude: 364,
    elapsedSeconds: 0,
    distanceNm: 0,
    trackTrue: 0,
    trackMag: 0,
    viaAirway: 'DCT',
    stage: 'CLB',
  },
  {
    ident: 'TOBAK',
    posLat: 50.10694,
    posLong: 8.28333,
    altitude: 12000,
    elapsedSeconds: 900,
    distanceNm: 21,
    trackTrue: 283,
    trackMag: 285,
    viaAirway: 'TOBAK1C',
    stage: 'CLB',
  },
  {
    ident: 'TOC',
    posLat: 50.63333,
    posLong: 6.5,
    altitude: 35000,
    elapsedSeconds: 1800,
    distanceNm: 88,
    trackTrue: 289,
    trackMag: 291,
    viaAirway: 'DCT',
    stage: 'CLB',
  },
  {
    ident: 'LAPEX',
    posLat: 53.51667,
    posLong: -10.0,
    altitude: 37000,
    elapsedSeconds: 7200,
    distanceNm: 620,
    trackTrue: 295,
    trackMag: 302,
    viaAirway: 'UN546',
    stage: 'CRZ',
  },
  {
    ident: '5620N',
    posLat: 56.0,
    posLong: -20.0,
    altitude: 39000,
    elapsedSeconds: 10800,
    distanceNm: 405,
    trackTrue: 288,
    trackMag: 305,
    viaAirway: 'NATA',
    stage: 'CRZ',
  },
  {
    ident: 'TOD',
    posLat: 42.5,
    posLong: -70.5,
    altitude: 39000,
    elapsedSeconds: 17400,
    distanceNm: 1580,
    trackTrue: 244,
    trackMag: 258,
    viaAirway: 'DCT',
    stage: 'CRZ',
  },
  {
    ident: 'KJFK',
    posLat: 40.6413,
    posLong: -73.7781,
    altitude: 13,
    elapsedSeconds: 19800,
    distanceNm: 49,
    trackTrue: 262,
    trackMag: 275,
    viaAirway: 'ROBER1',
    stage: 'DSC',
  },
];

const DLH82_TRACKS = [
  {
    identifier: 'A',
    direction: 'west' as const,
    tmi: '241',
    issuingOca: 'EGGX',
    route: 'MALOT 5620N 5730N 5740N 5650N JANJO',
    levels: [340, 350, 360, 370, 380, 390, 400],
    validFrom: new Date('2025-01-05 11:00'),
    validTo: new Date('2025-01-05 18:30'),
    fixes: [
      { ident: 'MALOT', latitude: 54, longitude: -15 },
      { ident: '5620N', latitude: 56, longitude: -20 },
      { ident: 'JANJO', latitude: 55.5, longitude: -53 },
    ],
  },
  {
    identifier: 'X',
    direction: 'east' as const,
    tmi: '241',
    issuingOca: 'CZQX',
    route: 'RESNO 5540N 5450N DOGAL',
    levels: [320, 330, 340, 350],
    validFrom: new Date('2025-01-05 23:00'),
    validTo: new Date('2025-01-06 06:30'),
    fixes: [
      { ident: 'RESNO', latitude: 55, longitude: -15 },
      { ident: 'DOGAL', latitude: 54.5, longitude: -50 },
    ],
  },
];

const CYYR = 'fa8ee2e9-fb94-4416-9ed0-4811efd488ae';
const CYYT = '6cf1fcd8-d072-46b5-8132-bd885b43dd97';
const BIKF = '523b2d2f-9b60-405a-bd5a-90eed1b58e9a';

const DLH82_ETOPS_POINTS = [
  {
    kind: 'entry' as const,
    ordinal: 1,
    isCritical: false,
    adequateAirportId: CYYT,
    posLat: 51.7549,
    posLong: -43.4583,
    elapsedSeconds: 9720,
    condition: 'DC',
    diversions: [CYYR],
  },
  {
    kind: 'equal_time' as const,
    ordinal: 1,
    isCritical: true,
    adequateAirportId: null,
    posLat: 52.0967,
    posLong: -33.4667,
    elapsedSeconds: 11940,
    condition: 'DC',
    diversions: [CYYR, BIKF],
  },
  {
    kind: 'exit' as const,
    ordinal: 1,
    isCritical: false,
    adequateAirportId: BIKF,
    posLat: 52.9433,
    posLong: -20.9317,
    elapsedSeconds: 14160,
    condition: 'DC',
    diversions: [BIKF],
  },
];

const DLH82_ETOPS_AIRPORTS = [
  {
    airportId: CYYR,
    suitabilityStart: new Date('2025-01-05 23:01'),
    suitabilityEnd: new Date('2025-01-06 02:52'),
    plannedRunway: '13',
    forecastCeiling: 900,
    forecastVisibility: 8050,
    transitionAltitude: 18000,
    transitionLevel: 18000,
  },
  {
    airportId: BIKF,
    suitabilityStart: new Date('2025-01-06 00:52'),
    suitabilityEnd: new Date('2025-01-06 04:10'),
    plannedRunway: '28',
    forecastCeiling: 1500,
    forecastVisibility: 9999,
    transitionAltitude: 7000,
    transitionLevel: 7500,
  },
];

export async function loadPlannedRoutes(
  tx: Prisma.TransactionClient,
): Promise<void> {
  await tx.flight.update({
    where: { id: DLH82 },
    data: {
      route: DLH82_ROUTE,
      oceanicRouting: 'track',
      oceanicTrackId: 'A',
      oceanicTrackDirection: 'west',
    },
  });

  await tx.flightOceanicTrack.createMany({
    data: DLH82_TRACKS.map((track) => ({
      flightId: DLH82,
      ...track,
      fixes: track.fixes as unknown as Prisma.InputJsonValue,
    })),
  });

  for (const point of DLH82_ETOPS_POINTS) {
    const { diversions, ...data } = point;

    await tx.flightEtopsPoint.create({
      data: {
        flightId: DLH82,
        ...data,
        diversionAirports: {
          create: diversions.map((airportId, ordinal) => ({
            airportId,
            ordinal: ordinal + 1,
          })),
        },
      },
    });
  }

  await tx.flightEtopsAirport.createMany({
    data: DLH82_ETOPS_AIRPORTS.map((airport) => ({
      flightId: DLH82,
      ...airport,
    })),
  });

  await tx.flightRouteFix.createMany({
    data: DLH82_FIXES.map((fix, ordinal) => ({
      flightId: DLH82,
      ordinal,
      ...fix,
    })),
  });
}
