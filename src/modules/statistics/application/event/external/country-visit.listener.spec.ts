import { CountryVisitListener } from './country-visit.listener';
import { StampCountryVisitHandler } from '../../command/stamp-country-visit.command';
import { UserCountryVisitRepository } from '../../../infra/database/user-country-visit.repository';
import { GetAirportByIdQuery } from '../../../../airports/application/query/get-airport-by-id.query';
import { GetFlightCompletionStatsQuery } from '../../../../flights/application/query/get-flight-completion-stats.query';
import { OnBlockWasReportedEvent } from '../../../../../core/domain/events/dto/flight.events';
import { FlightEventScope } from '../../../../flights/model/event.model';

const FLIGHT_ID = '2f1c0f5c-3f0a-4a1e-8b52-6b0f9a1c7d4e';
const CAPTAIN_ID = '9a4c1f0b-8d2e-4b3a-9f61-1c7e5d0a2b83';
const COMPLETED_AT = new Date('2026-03-14T18:30:00.000Z');

const AIRPORTS: Record<string, { icaoCode: string; country: string }> = {
  'aa3b1e77-0f42-4c8d-9e15-6b2a7c9d0e31': { icaoCode: 'EDDF', country: 'DE' },
  'bb7d2c19-5a63-4f0e-8c24-7d3b8e1f2a45': { icaoCode: 'EDDM', country: 'DE' },
  'cc9e4a02-6b18-4d7f-91a3-8e4c9f2b3d56': { icaoCode: 'LFPG', country: 'FR' },
  'dd1f6b53-7c29-4e80-a2b4-9f5d0a3c4e67': { icaoCode: 'EBBR', country: 'BE' },
};

const FRANKFURT = 'aa3b1e77-0f42-4c8d-9e15-6b2a7c9d0e31';
const MUNICH = 'bb7d2c19-5a63-4f0e-8c24-7d3b8e1f2a45';
const PARIS = 'cc9e4a02-6b18-4d7f-91a3-8e4c9f2b3d56';
const BRUSSELS = 'dd1f6b53-7c29-4e80-a2b4-9f5d0a3c4e67';

function arrivalAt(landingAirportId: string): OnBlockWasReportedEvent {
  return new OnBlockWasReportedEvent({
    flightId: FLIGHT_ID,
    scope: FlightEventScope.User,
    actorId: CAPTAIN_ID,
    aircraftId: '7e0b5d34-1a89-4c62-b0f7-2d8e6a1b4c95',
    landingAirportId,
    airportIds: [FRANKFURT, landingAirportId],
  });
}

describe('CountryVisitListener', () => {
  let record: jest.Mock;
  let cacheDel: jest.Mock;
  let completion: { captainId: string | null; completedAt: Date | null };
  let listener: CountryVisitListener;

  beforeEach(() => {
    record = jest.fn();
    cacheDel = jest.fn();
    completion = { captainId: CAPTAIN_ID, completedAt: COMPLETED_AT };

    const queryBus = {
      execute: jest.fn().mockImplementation((query: unknown) => {
        if (query instanceof GetFlightCompletionStatsQuery) {
          return Promise.resolve(completion);
        }

        if (query instanceof GetAirportByIdQuery) {
          const airport = AIRPORTS[query.airportId];

          return Promise.resolve({
            id: query.airportId,
            icaoCode: airport.icaoCode,
            country: { code: airport.country, name: airport.country },
          });
        }

        throw new Error('unexpected query');
      }),
    };

    const handler = new StampCountryVisitHandler(
      { del: cacheDel } as never,
      queryBus as never,
      { record } as unknown as UserCountryVisitRepository,
    );

    const commandBus = {
      execute: jest
        .fn()
        .mockImplementation((command: never) => handler.execute(command)),
    };

    listener = new CountryVisitListener(queryBus as never, commandBus as never);
  });

  function stampedCountries(): string[] {
    return record.mock.calls.map((call: unknown[]) => call[2] as string);
  }

  it('stamps the country the pilot landed in and no other', async () => {
    await listener.onOnBlockWasReported(arrivalAt(PARIS));

    expect(stampedCountries()).toEqual(['FR']);
  });

  it('stamps a domestic sector exactly once', async () => {
    await listener.onOnBlockWasReported(arrivalAt(MUNICH));

    expect(stampedCountries()).toEqual(['DE']);
  });

  it('stamps where a diverted flight actually landed', async () => {
    await listener.onOnBlockWasReported(arrivalAt(BRUSSELS));

    expect(stampedCountries()).toEqual(['BE']);
  });

  it('records the flight, the airport and the completion moment', async () => {
    await listener.onOnBlockWasReported(arrivalAt(PARIS));

    expect(record).toHaveBeenCalledWith(
      expect.any(String),
      CAPTAIN_ID,
      'FR',
      FLIGHT_ID,
      PARIS,
      COMPLETED_AT,
    );
  });

  it('claims the same stamp on a replayed event, leaving the database to reject the duplicate', async () => {
    await listener.onOnBlockWasReported(arrivalAt(PARIS));
    await listener.onOnBlockWasReported(arrivalAt(PARIS));

    const [first, second] = record.mock.calls;

    expect(first.slice(1)).toEqual(second.slice(1));
  });

  it('invalidates every cached read the stamp feeds', async () => {
    await listener.onOnBlockWasReported(arrivalAt(PARIS));

    const busted = cacheDel.mock.calls.map((call: string[]) => call[0]);

    expect(busted).toContain(`user:${CAPTAIN_ID}:stats-countries`);
    expect(
      busted.some((key) => key.startsWith(`user:${CAPTAIN_ID}:stats-periods:`)),
    ).toBe(true);
  });

  it('stamps nothing when the flight has no captain', async () => {
    completion = { captainId: null, completedAt: COMPLETED_AT };

    await listener.onOnBlockWasReported(arrivalAt(PARIS));

    expect(record).not.toHaveBeenCalled();
  });

  it('stamps nothing when the flight has not completed', async () => {
    completion = { captainId: CAPTAIN_ID, completedAt: null };

    await listener.onOnBlockWasReported(arrivalAt(PARIS));

    expect(record).not.toHaveBeenCalled();
  });
});

describe('UserCountryVisitRepository', () => {
  it('lets the unique index swallow a duplicate stamp', async () => {
    const createMany = jest.fn();
    const repository = new UserCountryVisitRepository({
      userCountryVisit: { createMany },
    } as never);

    await repository.record(
      '5c0a7e13-9b42-4d8f-a3e6-1f7b2c8d9e04',
      CAPTAIN_ID,
      'FR',
      FLIGHT_ID,
      PARIS,
      COMPLETED_AT,
    );

    expect(createMany).toHaveBeenCalledWith(
      expect.objectContaining({ skipDuplicates: true }),
    );
  });
});
