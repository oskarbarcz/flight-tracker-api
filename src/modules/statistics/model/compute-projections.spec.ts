import { computeProjections } from './compute-projections';
import type { CaptainFlightFact } from '../../flights/infra/database/repository/flights.repository';

const fact = (over: Partial<CaptainFlightFact> = {}): CaptainFlightFact => ({
  flightId: 'f1',
  completedAt: new Date('2025-01-01T16:00:00.000Z'),
  greatCircleDistance: 100,
  fuelBurned: 1000,
  airborneMinutes: 60,
  blockMinutes: 75,
  aircraftType: 'A320',
  operatorId: 'op1',
  airports: [
    {
      airportId: 'a1',
      icaoCode: 'EDDF',
      country: 'Germany',
      continent: 'europe',
    },
    {
      airportId: 'a2',
      icaoCode: 'LFPG',
      country: 'France',
      continent: 'europe',
    },
  ],
  ...over,
});

describe('computeProjections', () => {
  it('returns zeros for a pilot with no flights', () => {
    const projection = computeProjections([]);

    expect(projection.total.flights).toBe(0);
    expect(projection.total.distanceNm).toBe(0);
    expect(projection.total.firstFlightAt).toBeNull();
    expect(projection.total.mostFlownOperatorId).toBeNull();
    expect(projection.byType).toEqual([]);
    expect(projection.byAirport).toEqual([]);
    expect(projection.daily).toEqual([]);
  });

  it('aggregates a single flight into totals, records and dimensions', () => {
    const projection = computeProjections([fact()]);

    expect(projection.total).toMatchObject({
      flights: 1,
      distanceNm: 100,
      airborneMinutes: 60,
      blockMinutes: 75,
      fuelBurned: 1000,
      longestFlightDistanceNm: 100,
      longestFlightMinutes: 60,
      mostFlownOperatorId: 'op1',
    });
    expect(projection.byType).toHaveLength(1);
    expect(projection.byType[0]).toMatchObject({ type: 'A320', flights: 1 });
    // one visit to each of the two airports
    expect(projection.byAirport.map((a) => a.visits)).toEqual([1, 1]);
    expect(projection.daily).toHaveLength(1);
    expect(projection.daily[0].flights).toBe(1);
  });

  it('accumulates multiple sectors across types, airports and days', () => {
    const projection = computeProjections([
      fact({
        flightId: 'f1',
        completedAt: new Date('2025-01-01T16:00:00.000Z'),
      }),
      fact({
        flightId: 'f2',
        completedAt: new Date('2025-01-02T09:00:00.000Z'),
        aircraftType: 'B738',
        greatCircleDistance: 300,
        airborneMinutes: 90,
        blockMinutes: 100,
        airports: [
          {
            airportId: 'a1',
            icaoCode: 'EDDF',
            country: 'Germany',
            continent: 'europe',
          },
          {
            airportId: 'a3',
            icaoCode: 'LEBL',
            country: 'Spain',
            continent: 'europe',
          },
        ],
      }),
    ]);

    expect(projection.total.flights).toBe(2);
    expect(projection.total.distanceNm).toBe(400);
    expect(projection.total.longestFlightDistanceNm).toBe(300);
    expect(projection.byType).toHaveLength(2);
    expect(projection.daily).toHaveLength(2);
    // a1 visited on both sectors
    const a1 = projection.byAirport.find((a) => a.airportId === 'a1');
    expect(a1?.visits).toBe(2);
  });

  it('counts a flight with a missing duration without breaking the sums', () => {
    const projection = computeProjections([
      fact({ airborneMinutes: null, blockMinutes: null }),
    ]);

    expect(projection.total.flights).toBe(1);
    expect(projection.total.airborneMinutes).toBe(0);
    expect(projection.total.blockMinutes).toBe(0);
    expect(projection.total.longestFlightMinutes).toBe(0);
  });

  it('is idempotent — the same facts always produce the same projection', () => {
    const facts = [fact({ flightId: 'f1' }), fact({ flightId: 'f2' })];

    expect(computeProjections(facts)).toEqual(computeProjections(facts));
  });

  it('breaks an operator tie deterministically by id', () => {
    const projection = computeProjections([
      fact({ flightId: 'f1', operatorId: 'zulu' }),
      fact({ flightId: 'f2', operatorId: 'alpha' }),
    ]);

    expect(projection.total.mostFlownOperatorId).toBe('alpha');
  });
});
