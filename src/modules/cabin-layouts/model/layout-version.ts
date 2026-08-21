import { createHash } from 'node:crypto';
import { AerolopaSeatMap } from '../../../core/provider/aerolopa/type/aerolopa.types';

export type CabinDeckName = 'main' | 'upper';

export interface AssembledDeck {
  deck: CabinDeckName;
  sourceSlug: string;
  canvasWidth: number;
  canvasHeight: number;
  seatCount: number;
  lastUpdated: string | null;
  assets: AerolopaSeatMap['assets'];
  cabins: AerolopaSeatMap['cabins'];
  seats: AerolopaSeatMap['seats'];
}

export interface AssembledVersion {
  contentHash: string;
  aircraftType: string;
  aircraftTypeDisplayed: string;
  manufacturer: string;
  haulType: string;
  isDualDeck: boolean;
  totalSeats: number;
  seatCounts: AerolopaSeatMap['seatCounts'];
  lastUpdated: string | null;
  decks: AssembledDeck[];
}

const SEAT_COUNT_KEYS = [
  'first',
  'business',
  'premium_economy',
  'economy',
  'total',
] as const;

function withoutAssetQueries(
  assets: AerolopaSeatMap['assets'],
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(assets).map(([key, value]) => [key, stripQuery(value)]),
  );
}

function publishedDate(value: string): string | null {
  return Number.isNaN(Date.parse(value)) ? null : value;
}

export function revisionDate(value: string | null, fallback: Date): Date {
  return value === null ? fallback : new Date(value);
}

function stripQuery(url: string): string {
  const separator = url.indexOf('?');

  return separator === -1 ? url : url.slice(0, separator);
}

export function hashSeatMaps(seatMaps: AerolopaSeatMap[]): string {
  const canonical = [...seatMaps]
    .sort((left, right) => left.slug.localeCompare(right.slug))
    .map((seatMap) => ({
      ...seatMap,
      assets: withoutAssetQueries(seatMap.assets),
      seats: [...seatMap.seats].sort((left, right) =>
        left.designator.localeCompare(right.designator),
      ),
    }));

  return createHash('sha256').update(JSON.stringify(canonical)).digest('hex');
}

export function deckNameFor(slug: string): CabinDeckName {
  return slug.endsWith('-u') ? 'upper' : 'main';
}

export function assembleVersion(seatMaps: AerolopaSeatMap[]): AssembledVersion {
  const ordered = [...seatMaps].sort((left, right) =>
    deckNameFor(left.slug).localeCompare(deckNameFor(right.slug)),
  );

  const [primary] = ordered;

  const decks: AssembledDeck[] = ordered.map((seatMap) => ({
    deck: deckNameFor(seatMap.slug),
    sourceSlug: seatMap.slug,
    canvasWidth: seatMap.canvas.width,
    canvasHeight: seatMap.canvas.height,
    seatCount: seatMap.seats.length,
    lastUpdated: publishedDate(seatMap.lastUpdated),
    assets: seatMap.assets,
    cabins: seatMap.cabins,
    seats: seatMap.seats,
  }));

  const seatCounts = SEAT_COUNT_KEYS.reduce(
    (totals, key) => ({
      ...totals,
      [key]: ordered.reduce(
        (sum, seatMap) => sum + (seatMap.seatCounts[key] ?? 0),
        0,
      ),
    }),
    {} as AerolopaSeatMap['seatCounts'],
  );

  const lastUpdated =
    decks
      .map((deck) => deck.lastUpdated)
      .filter((value): value is string => value !== null)
      .sort()
      .at(-1) ?? null;

  return {
    contentHash: hashSeatMaps(seatMaps),
    aircraftType: primary.aircraftType,
    aircraftTypeDisplayed: primary.aircraftTypeDisplayed,
    manufacturer: primary.manufacturer,
    haulType: primary.haulType,
    isDualDeck: ordered.some((seatMap) => seatMap.isDualDeck),
    totalSeats: decks.reduce((sum, deck) => sum + deck.seatCount, 0),
    seatCounts,
    lastUpdated,
    decks: decks.map((deck) => ({
      ...deck,
      lastUpdated: deck.lastUpdated ?? lastUpdated,
    })),
  };
}
