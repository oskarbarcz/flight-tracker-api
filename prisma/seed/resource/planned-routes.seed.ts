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

export async function loadPlannedRoutes(
  tx: Prisma.TransactionClient,
): Promise<void> {
  await tx.flight.update({
    where: { id: DLH82 },
    data: { route: DLH82_ROUTE },
  });

  await tx.flightRouteFix.createMany({
    data: DLH82_FIXES.map((fix, ordinal) => ({
      flightId: DLH82,
      ordinal,
      ...fix,
    })),
  });
}
