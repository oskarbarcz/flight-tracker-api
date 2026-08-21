import {
  assembleVersion,
  deckNameFor,
  hashSeatMaps,
  revisionDate,
} from './layout-version';
import {
  AerolopaSeat,
  AerolopaSeatMap,
} from '../../../core/provider/aerolopa/type/aerolopa.types';

function seat(designator: string, cabin: AerolopaSeat['cabin']): AerolopaSeat {
  return {
    designator,
    x: 178,
    y: 849,
    width: 57.3,
    height: 77.2,
    rotation: 0,
    reversed: false,
    cabin,
    rating: null,
    color: '',
    bookable: true,
    blocked: false,
    crewRest: false,
    windowStatus: null,
    seatProduct: null,
    comments: [],
  };
}

function seatRange(
  rows: number[],
  letters: string[],
  cabin: AerolopaSeat['cabin'],
): AerolopaSeat[] {
  return rows.flatMap((row) =>
    letters.map((letter) =>
      seat(`${String(row).padStart(2, '0')}${letter}`, cabin),
    ),
  );
}

function seatMap(
  slug: string,
  overrides: Partial<AerolopaSeatMap> = {},
): AerolopaSeatMap {
  const seats = overrides.seats ?? [seat('01A', 'economy')];

  return {
    slug,
    airlineIata: 'LH',
    aircraftIata: '74H',
    aircraftType: 'Boeing 747-8',
    aircraftTypeDisplayed: 'Boeing 747-8',
    manufacturer: 'Boeing',
    haulType: 'Long Haul',
    isDualDeck: false,
    totalSeats: seats.length,
    lastUpdated: '2025-03-31',
    seatCounts: {
      first: 0,
      business: 0,
      premium_economy: 0,
      economy: seats.length,
      total: seats.length,
    },
    canvas: { width: 800, height: 3970 },
    assets: {
      image: `https://cdn.example/${slug}.webp?v=1786776955`,
      imageNeutral: `https://cdn.example/${slug}.neutral.webp?v=1786776955`,
      svg: `https://maptool.example/${slug}/svg`,
      seatRects: `https://maptool.example/${slug}/seat-rects`,
    },
    cabins: [],
    ...overrides,
    seats,
  };
}

// Mirrors the real lh-74h pair: main deck rows 1–49, upper deck rows 81–88,
// separate canvases, 332 + 32 seats.
function realisticDeckPair(): AerolopaSeatMap[] {
  const rows = (from: number, to: number) =>
    Array.from({ length: to - from + 1 }, (_, index) => from + index);

  const mainSeats = [
    ...seatRange(rows(1, 2), ['A', 'D', 'G', 'K'], 'first'),
    ...seatRange(rows(3, 14), ['A', 'C', 'H', 'K'], 'business'),
    ...seatRange(rows(15, 18), ['A', 'B', 'C', 'H', 'J', 'K'], 'economy'),
    ...seatRange(
      rows(19, 46),
      ['A', 'B', 'C', 'D', 'E', 'G', 'H', 'J', 'K'],
      'economy',
    ),
  ];

  const upperSeats = seatRange(
    [81, 82, 83, 84, 85, 86, 87, 88],
    ['A', 'C', 'H', 'K'],
    'business',
  );

  return [
    seatMap('lh-74h-m', {
      isDualDeck: true,
      canvas: { width: 800, height: 5239 },
      seats: mainSeats,
      seatCounts: {
        first: 8,
        business: 48,
        premium_economy: 0,
        economy: mainSeats.length - 56,
        total: mainSeats.length,
      },
    }),
    seatMap('lh-74h-u', {
      isDualDeck: true,
      canvas: { width: 800, height: 2507 },
      seats: upperSeats,
      seatCounts: {
        first: 0,
        business: 32,
        premium_economy: 0,
        economy: 0,
        total: 32,
      },
    }),
  ];
}

describe('deckNameFor', () => {
  it('reads the upper deck from the source identifier', () => {
    expect(deckNameFor('lh-74h-u')).toBe('upper');
    expect(deckNameFor('lh-388-2-u')).toBe('upper');
  });

  it('treats everything else as the main deck', () => {
    expect(deckNameFor('lh-74h-m')).toBe('main');
    expect(deckNameFor('lh-32n')).toBe('main');
    expect(deckNameFor('sq-359-m')).toBe('main');
  });
});

describe('hashSeatMaps', () => {
  it('ignores the cache-busting parameter on asset URLs', () => {
    const before = seatMap('lh-32n');
    const after = seatMap('lh-32n', {
      assets: {
        image: 'https://cdn.example/lh-32n.webp?v=9999999999',
        imageNeutral: 'https://cdn.example/lh-32n.neutral.webp?v=9999999999',
        svg: 'https://maptool.example/lh-32n/svg',
        seatRects: 'https://maptool.example/lh-32n/seat-rects',
      },
    });

    expect(hashSeatMaps([after])).toBe(hashSeatMaps([before]));
  });

  it('changes when a seat changes', () => {
    const before = seatMap('lh-32n');
    const after = seatMap('lh-32n', {
      seats: [{ ...seat('01A', 'economy'), rating: 'red' }],
    });

    expect(hashSeatMaps([after])).not.toBe(hashSeatMaps([before]));
  });

  it('changes when the asset path itself changes', () => {
    const before = seatMap('lh-32n');
    const after = seatMap('lh-32n', {
      assets: { ...before.assets, svg: 'https://maptool.example/other/svg' },
    });

    expect(hashSeatMaps([after])).not.toBe(hashSeatMaps([before]));
  });

  it('does not depend on the order seat maps or seats arrive in', () => {
    const [main, upper] = realisticDeckPair();
    const shuffled = {
      ...main,
      seats: [...main.seats].reverse(),
    };

    expect(hashSeatMaps([upper, shuffled])).toBe(hashSeatMaps([main, upper]));
  });
});

describe('assembleVersion', () => {
  it('sums the seats of a deck pair into one aircraft total', () => {
    const version = assembleVersion(realisticDeckPair());

    expect(version.decks).toHaveLength(2);
    expect(version.decks.map(({ deck }) => deck)).toEqual(['main', 'upper']);
    expect(version.decks[0].seatCount + version.decks[1].seatCount).toBe(
      version.totalSeats,
    );
    expect(version.totalSeats).toBe(364);
  });

  it('keeps each deck on its own canvas', () => {
    const version = assembleVersion(realisticDeckPair());

    expect(version.decks[0].canvasHeight).toBe(5239);
    expect(version.decks[1].canvasHeight).toBe(2507);
  });

  it('sums the seat counts per cabin class across decks', () => {
    const version = assembleVersion(realisticDeckPair());

    expect(version.seatCounts.business).toBe(80);
    expect(version.seatCounts.first).toBe(8);
    expect(version.seatCounts.total).toBe(364);
  });

  it('reports no designator shared between the decks', () => {
    const version = assembleVersion(realisticDeckPair());
    const designators = version.decks.flatMap(({ seats }) =>
      seats.map(({ designator }) => designator),
    );

    expect(new Set(designators).size).toBe(designators.length);
  });

  it('marks the aircraft dual deck when either half says so', () => {
    expect(assembleVersion(realisticDeckPair()).isDualDeck).toBe(true);
  });

  it('takes the most recent revision date across decks', () => {
    const [main, upper] = realisticDeckPair();
    const version = assembleVersion([
      { ...main, lastUpdated: '2024-01-01' },
      { ...upper, lastUpdated: '2025-06-30' },
    ]);

    expect(version.lastUpdated).toBe('2025-06-30');
  });

  it('assembles a single-deck layout as one main deck', () => {
    const version = assembleVersion([seatMap('lh-32n')]);

    expect(version.decks).toHaveLength(1);
    expect(version.decks[0].deck).toBe('main');
    expect(version.decks[0].sourceSlug).toBe('lh-32n');
    expect(version.isDualDeck).toBe(false);
    expect(version.totalSeats).toBe(1);
  });

  it('orders the main deck before the upper deck whatever order they arrive in', () => {
    const [main, upper] = realisticDeckPair();

    expect(
      assembleVersion([upper, main]).decks.map(({ deck }) => deck),
    ).toEqual(['main', 'upper']);
  });

  it('takes the sibling deck date when AeroLOPA leaves one deck undated', () => {
    const [main, upper] = realisticDeckPair();
    const version = assembleVersion([
      { ...main, lastUpdated: '' },
      { ...upper, lastUpdated: '2025-06-30' },
    ]);

    expect(version.lastUpdated).toBe('2025-06-30');
    expect(version.decks.map(({ lastUpdated }) => lastUpdated)).toEqual([
      '2025-06-30',
      '2025-06-30',
    ]);
  });

  it('reports no revision date when AeroLOPA dates neither deck', () => {
    const [main, upper] = realisticDeckPair();
    const version = assembleVersion([
      { ...main, lastUpdated: '' },
      { ...upper, lastUpdated: '' },
    ]);

    expect(version.lastUpdated).toBeNull();
    expect(version.decks.map(({ lastUpdated }) => lastUpdated)).toEqual([
      null,
      null,
    ]);
  });

  it('reports no revision date when a single deck carries none', () => {
    const version = assembleVersion([seatMap('lh-32n', { lastUpdated: '' })]);

    expect(version.lastUpdated).toBeNull();
    expect(version.decks[0].lastUpdated).toBeNull();
  });
});

describe('revisionDate', () => {
  it('keeps the date AeroLOPA published', () => {
    const date = revisionDate('2025-06-30', new Date('2026-08-21T09:12:00Z'));

    expect(date.toISOString().slice(0, 10)).toBe('2025-06-30');
  });

  it('falls back to the fetch time when the layout carries no date', () => {
    const fetchedAt = new Date('2026-08-21T09:12:00Z');

    expect(revisionDate(null, fetchedAt)).toBe(fetchedAt);
  });
});
