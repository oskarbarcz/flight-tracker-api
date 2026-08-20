import { Prisma } from '../../client/client';
import { AerolopaSeatMap } from '../../../src/core/provider/aerolopa/type/aerolopa.types';
import {
  AssembledVersion,
  assembleVersion,
} from '../../../src/modules/cabin-layouts/model/layout-version';
import expectations from '../../../docker/mock/aerolopa.json';

const SEEDED_LAYOUTS: Record<string, string[]> = {
  'aa-77w': ['aa-77w'],
  'de-321': ['de-321'],
  'lh-74h': ['lh-74h-m', 'lh-74h-u'],
};

export function assembledLayout(layoutId: string): AssembledVersion {
  const sourceSlugs = SEEDED_LAYOUTS[layoutId];

  if (!sourceSlugs) {
    throw new Error(`Cabin layout "${layoutId}" is not seeded.`);
  }

  return assembleVersion(sourceSlugs.map(readSeatMap));
}

export async function loadCabinLayoutVersions(
  tx: Prisma.TransactionClient,
): Promise<void> {
  const fetchedAt = new Date();

  for (const [layoutId, sourceSlugs] of Object.entries(SEEDED_LAYOUTS)) {
    const seatMaps = sourceSlugs.map(readSeatMap);
    const assembled = assembleVersion(seatMaps);

    await tx.cabinLayoutVersion.create({
      data: {
        layoutId,
        revision: 1,
        contentHash: assembled.contentHash,
        aircraftType: assembled.aircraftType,
        aircraftTypeDisplayed: assembled.aircraftTypeDisplayed,
        manufacturer: assembled.manufacturer,
        haulType: assembled.haulType,
        isDualDeck: assembled.isDualDeck,
        totalSeats: assembled.totalSeats,
        seatCounts: assembled.seatCounts as never,
        lastUpdated: new Date(assembled.lastUpdated),
        fetchedAt,
        rawPayload: seatMaps as never,
        decks: {
          create: assembled.decks.map((deck) => ({
            deck: deck.deck,
            sourceSlug: deck.sourceSlug,
            canvasWidth: deck.canvasWidth,
            canvasHeight: deck.canvasHeight,
            seatCount: deck.seatCount,
            lastUpdated: new Date(deck.lastUpdated),
            assets: deck.assets as never,
            cabins: deck.cabins as never,
            seats: {
              create: deck.seats.map((seat) => ({
                designator: seat.designator,
                x: seat.x,
                y: seat.y,
                width: seat.width,
                height: seat.height,
                rotation: seat.rotation,
                reversed: seat.reversed,
                cabin: seat.cabin,
                rating: seat.rating,
                color: seat.color,
                bookable: seat.bookable,
                blocked: seat.blocked,
                crewRest: seat.crewRest,
                windowStatus: seat.windowStatus,
                seatProduct: seat.seatProduct,
                comments: seat.comments as never,
              })),
            },
          })),
        },
      },
    });
  }
}

function readSeatMap(slug: string): AerolopaSeatMap {
  const expectation = expectations.find((candidate) => {
    const request = candidate.httpRequest as {
      path?: string;
      queryStringParameters?: Record<string, string[]>;
    };

    return (
      request.path?.endsWith('/aerolopa/seatmap') === true &&
      request.queryStringParameters?.slug?.[0] === slug
    );
  });

  const body = expectation?.httpResponse?.body as
    | { seatMap?: unknown }
    | undefined;

  if (!body?.seatMap) {
    throw new Error(`No seat map fixture for cabin layout source "${slug}".`);
  }

  return body.seatMap as AerolopaSeatMap;
}
