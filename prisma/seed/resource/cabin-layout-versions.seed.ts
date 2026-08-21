import { Prisma } from '../../client/client';
import { AerolopaSeatMap } from '../../../src/core/provider/aerolopa/type/aerolopa.types';
import {
  AssembledVersion,
  assembleVersion,
  revisionDate,
} from '../../../src/modules/cabin-layouts/model/layout-version';
import expectations from '../../../docker/mock/functions/aerolopa.json';

const SEEDED_LAYOUTS: Record<string, string[]> = {
  'aa-77w': ['aa-77w'],
  'de-321': ['de-321'],
  'lh-74h': ['lh-74h-m', 'lh-74h-u'],
};

const assembled = new Map<string, AssembledVersion>();

export function assembledLayout(layoutId: string): AssembledVersion {
  const cached = assembled.get(layoutId);

  if (cached) {
    return cached;
  }

  const sourceSlugs = SEEDED_LAYOUTS[layoutId];

  if (!sourceSlugs) {
    throw new Error(`Cabin layout "${layoutId}" is not seeded.`);
  }

  const version = assembleVersion(sourceSlugs.map(readSeatMap));
  assembled.set(layoutId, version);

  return version;
}

export async function loadCabinLayoutVersions(
  tx: Prisma.TransactionClient,
): Promise<void> {
  const fetchedAt = new Date();

  for (const [layoutId, sourceSlugs] of Object.entries(SEEDED_LAYOUTS)) {
    const seatMaps = sourceSlugs.map(readSeatMap);
    const layout = assembledLayout(layoutId);

    const version = await tx.cabinLayoutVersion.create({
      data: {
        layoutId,
        revision: 1,
        contentHash: layout.contentHash,
        aircraftType: layout.aircraftType,
        aircraftTypeDisplayed: layout.aircraftTypeDisplayed,
        manufacturer: layout.manufacturer,
        haulType: layout.haulType,
        isDualDeck: layout.isDualDeck,
        totalSeats: layout.totalSeats,
        seatCounts: layout.seatCounts as never,
        lastUpdated: revisionDate(layout.lastUpdated, fetchedAt),
        fetchedAt,
        rawPayload: seatMaps as never,
      },
      select: { id: true },
    });

    for (const deck of layout.decks) {
      const created = await tx.cabinLayoutDeck.create({
        data: {
          versionId: version.id,
          deck: deck.deck,
          sourceSlug: deck.sourceSlug,
          canvasWidth: deck.canvasWidth,
          canvasHeight: deck.canvasHeight,
          seatCount: deck.seatCount,
          lastUpdated: revisionDate(deck.lastUpdated, fetchedAt),
          assets: deck.assets as never,
          cabins: deck.cabins as never,
        },
        select: { id: true },
      });

      await tx.cabinLayoutSeat.createMany({
        data: deck.seats.map((seat) => ({
          deckId: created.id,
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
      });
    }
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
