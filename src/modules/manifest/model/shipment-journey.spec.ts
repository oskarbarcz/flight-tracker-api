import {
  CargoAirport,
  drawBeyondPoint,
  drawJourney,
  FlightLeg,
  isRaisedByOperator,
  isTightConnection,
  JourneyContext,
  MINIMUM_CONNECTION_MINUTES,
  pickAirport,
  TransferRole,
  transferRoleOf,
} from './shipment-journey';
import { Continent } from '../../airports/model/airport.model';

const leg: FlightLeg = { departure: 'FRA', arrival: 'JFK' };

const candidates: CargoAirport[] = [
  { iataCode: 'CDG', continent: Continent.Europe },
  { iataCode: 'WAW', continent: Continent.Europe },
  { iataCode: 'KEF', continent: Continent.Europe },
  { iataCode: 'BOS', continent: Continent.NorthAmerica },
  { iataCode: 'PHL', continent: Continent.NorthAmerica },
  { iataCode: 'YYT', continent: Continent.NorthAmerica },
];

function seededRandom(seed: number): () => number {
  let state = seed;

  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

function context(seed: number): JourneyContext {
  return {
    leg,
    departureContinent: Continent.Europe,
    arrivalContinent: Continent.NorthAmerica,
    candidates,
    carriers: ['AC', 'DL', 'UA'],
    random: seededRandom(seed),
  };
}

describe('shipment journey', () => {
  it('reads cargo raised and delivered on this flight as local', () => {
    expect(transferRoleOf('FRA', 'JFK', leg)).toBe(TransferRole.Local);
  });

  it('reads cargo raised here and continuing as an outbound transfer', () => {
    expect(transferRoleOf('FRA', 'YYZ', leg)).toBe(
      TransferRole.OutboundTransfer,
    );
  });

  it('reads cargo arriving from elsewhere and terminating as an inbound transfer', () => {
    expect(transferRoleOf('BLR', 'JFK', leg)).toBe(
      TransferRole.InboundTransfer,
    );
  });

  it('reads cargo passing through as a through transfer', () => {
    expect(transferRoleOf('BLR', 'YYZ', leg)).toBe(
      TransferRole.ThroughTransfer,
    );
  });

  it('treats only cargo raised here as raised by the operator', () => {
    expect(isRaisedByOperator(TransferRole.Local)).toBe(true);
    expect(isRaisedByOperator(TransferRole.OutboundTransfer)).toBe(true);
    expect(isRaisedByOperator(TransferRole.InboundTransfer)).toBe(false);
    expect(isRaisedByOperator(TransferRole.ThroughTransfer)).toBe(false);
  });

  it('flags a connection below the minimum as tight', () => {
    expect(isTightConnection(MINIMUM_CONNECTION_MINUTES - 1)).toBe(true);
    expect(isTightConnection(MINIMUM_CONNECTION_MINUTES)).toBe(false);
    expect(isTightConnection(null)).toBe(false);
  });

  it('prefers an airport in the region it is given', () => {
    const picked = Array.from({ length: 200 }, (_, index) =>
      pickAirport(candidates, Continent.Europe, seededRandom(index + 1)),
    );
    const european = picked.filter(
      (airport) => airport?.continent === Continent.Europe,
    );

    expect(european.length).toBeGreaterThan(picked.length / 2);
  });

  it('picks nothing from an empty candidate list', () => {
    expect(pickAirport([], Continent.Europe, seededRandom(1))).toBeNull();
  });

  it('never draws the arrival itself as a beyond point', () => {
    const drawn = Array.from({ length: 100 }, (_, index) =>
      drawBeyondPoint(context(index + 1)),
    );

    expect(drawn.filter((point) => point === 'JFK')).toEqual([]);
    expect(drawn.every((point) => point !== null)).toBe(true);
  });

  it('names an onward carrier, flight and connection when cargo continues', () => {
    const journey = drawJourney(context(3), 'YYT');

    expect(journey.destination).toBe('YYT');
    expect(journey.onwardCarrier).not.toBeNull();
    expect(journey.onwardFlightNumber).toMatch(/^[A-Z]{2}\d{4}$/);
    expect(journey.connectionMinutes).not.toBeNull();
  });

  it('names no connection when cargo terminates at the arrival', () => {
    const journey = drawJourney(context(3), null);

    expect(journey.destination).toBe('JFK');
    expect(journey.onwardCarrier).toBeNull();
    expect(journey.onwardFlightNumber).toBeNull();
    expect(journey.connectionMinutes).toBeNull();
  });

  it('honours a destination the caller fixes', () => {
    const journeys = Array.from({ length: 30 }, (_, index) =>
      drawJourney(context(index + 1), 'BOS'),
    );

    expect(journeys.every((journey) => journey.destination === 'BOS')).toBe(
      true,
    );
  });

  it('produces all four roles across many draws', () => {
    const roles = new Set(
      Array.from(
        { length: 400 },
        (_, index) => drawJourney(context(index + 1)).transferRole,
      ),
    );

    expect([...roles].sort()).toEqual([
      TransferRole.InboundTransfer,
      TransferRole.Local,
      TransferRole.OutboundTransfer,
      TransferRole.ThroughTransfer,
    ]);
  });

  it('keeps every drawn journey internally consistent', () => {
    const journeys = Array.from({ length: 300 }, (_, index) =>
      drawJourney(context(index + 1)),
    );

    const wrong = journeys.filter(
      (journey) =>
        journey.transferRole !==
          transferRoleOf(journey.origin, journey.destination, leg) ||
        (journey.destination === leg.arrival &&
          journey.onwardCarrier !== null) ||
        (journey.destination !== leg.arrival && journey.onwardCarrier === null),
    );

    expect(wrong).toEqual([]);
  });

  it('falls back to the flight itself when nothing else is known', () => {
    const journey = drawJourney({
      ...context(5),
      candidates: [],
      carriers: [],
    });

    expect(journey.origin).toBe('FRA');
    expect(journey.destination).toBe('JFK');
    expect(journey.transferRole).toBe(TransferRole.Local);
  });
});
