import {
  AllocatableSeat,
  allocateSeats,
  assignPnrs,
  distributePassengers,
  generatePnr,
} from './manifest-generation';

const KL738_CABINS = { business: 30, economy: 156 };

function seatsOf(cabinSizes: Record<string, number>): AllocatableSeat[] {
  return Object.entries(cabinSizes).flatMap(([cabin, size]) =>
    Array.from({ length: size }, (_, index) => ({
      designator: `${cabin[0].toUpperCase()}${index + 1}`,
      deck: 'main' as const,
      cabin,
    })),
  );
}

describe('passenger distribution', () => {
  it('fills cabins in proportion to their size', () => {
    expect(distributePassengers(KL738_CABINS, 150)).toEqual({
      business: 24,
      economy: 126,
    });
  });

  it('sums to the requested total', () => {
    for (const total of [1, 7, 63, 99, 150, 185]) {
      const allocation = distributePassengers(KL738_CABINS, total);
      const seated = Object.values(allocation).reduce(
        (sum, count) => sum + count,
        0,
      );

      expect(seated).toBe(total);
    }
  });

  it('gives the rounding remainder to the largest cabin', () => {
    expect(distributePassengers({ business: 4, economy: 6 }, 5)).toEqual({
      business: 2,
      economy: 3,
    });
  });

  it('fills every seat of every cabin on a full load', () => {
    expect(distributePassengers(KL738_CABINS, 186)).toEqual(KL738_CABINS);
  });

  it('never seats more passengers than the cabin holds', () => {
    expect(distributePassengers(KL738_CABINS, 400)).toEqual(KL738_CABINS);
  });

  it('seats nobody for an empty flight', () => {
    expect(distributePassengers(KL738_CABINS, 0)).toEqual({
      business: 0,
      economy: 0,
    });
  });

  it('distributes across four cabins of a widebody', () => {
    const cabins = {
      first: 8,
      business: 52,
      premium_economy: 28,
      economy: 216,
    };

    const allocation = distributePassengers(cabins, 200);
    const seated = Object.values(allocation).reduce(
      (sum, count) => sum + count,
      0,
    );

    expect(seated).toBe(200);
    expect(allocation.first).toBeLessThanOrEqual(cabins.first);
    expect(allocation.economy).toBeGreaterThan(allocation.business);
  });
});

describe('seat allocation', () => {
  it('allocates one distinct seat per passenger', () => {
    const allocated = allocateSeats(seatsOf(KL738_CABINS), 150);
    const designators = new Set(allocated.map((seat) => seat.designator));

    expect(allocated).toHaveLength(150);
    expect(designators.size).toBe(150);
  });

  it('respects the proportional split per cabin', () => {
    const allocated = allocateSeats(seatsOf(KL738_CABINS), 150);

    const perCabin = allocated.reduce<Record<string, number>>(
      (counts, seat) => ({
        ...counts,
        [seat.cabin]: (counts[seat.cabin] ?? 0) + 1,
      }),
      {},
    );

    expect(perCabin).toEqual({ business: 24, economy: 126 });
  });

  it('occupies every seat on a full load', () => {
    const seats = seatsOf(KL738_CABINS);
    const allocated = allocateSeats(seats, seats.length);

    expect(new Set(allocated.map((seat) => seat.designator)).size).toBe(
      seats.length,
    );
  });

  it('picks different seats on different runs of a partial load', () => {
    const seats = seatsOf(KL738_CABINS);
    const first = allocateSeats(seats, 20)
      .map((seat) => seat.designator)
      .sort();
    const second = allocateSeats(seats, 20)
      .map((seat) => seat.designator)
      .sort();

    expect(first).not.toEqual(second);
  });

  it('keeps the deck of every seat it allocates', () => {
    const decks: AllocatableSeat[] = [
      { designator: '01A', deck: 'main', cabin: 'business' },
      { designator: '81A', deck: 'upper', cabin: 'business' },
    ];

    const allocated = allocateSeats(decks, 2);

    expect(
      allocated
        .map(({ designator, deck }) => ({ designator, deck }))
        .sort((one, other) => one.designator.localeCompare(other.designator)),
    ).toEqual([
      { designator: '01A', deck: 'main' },
      { designator: '81A', deck: 'upper' },
    ]);
  });
});

describe('booking references', () => {
  it('states a booking reference as six upper-case alphanumerics', () => {
    for (let attempt = 0; attempt < 200; attempt++) {
      expect(generatePnr()).toMatch(/^[A-Z0-9]{6}$/);
    }
  });

  it('gives every passenger a booking reference', () => {
    const pnrs = assignPnrs(150);

    expect(pnrs).toHaveLength(150);
    expect(pnrs.every((pnr) => /^[A-Z0-9]{6}$/.test(pnr))).toBe(true);
  });

  it('books roughly one passenger in five together with another', () => {
    const pnrs = assignPnrs(5000);
    const shared = 1 - new Set(pnrs).size / pnrs.length;

    expect(shared).toBeGreaterThan(0.1);
    expect(shared).toBeLessThan(0.3);
  });

  it('books most passengers on their own reference', () => {
    const pnrs = assignPnrs(500);

    expect(new Set(pnrs).size).toBeGreaterThan(300);
  });

  it('needs no reference for an empty manifest', () => {
    expect(assignPnrs(0)).toEqual([]);
  });
});
