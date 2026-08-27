import { CityVisitListener } from './city-visit.listener';
import { RecordCityVisitHandler } from '../../command/record-city-visit.command';
import { UserCityVisitRepository } from '../../../infra/database/user-city-visit.repository';
import { GetAirportByIdQuery } from '../../../../airports/application/query/get-airport-by-id.query';
import { GetFlightCompletionStatsQuery } from '../../../../flights/application/query/get-flight-completion-stats.query';
import { AwardPostcardCommand } from '../../../../game/application/command/postcard/award-postcard.command';
import { OnBlockWasReportedEvent } from '../../../../../core/domain/events/dto/flight.events';
import { FlightEventScope } from '../../../../flights/model/event.model';

const FLIGHT_ID = '2f1c0f5c-3f0a-4a1e-8b52-6b0f9a1c7d4e';
const CAPTAIN_ID = '9a4c1f0b-8d2e-4b3a-9f61-1c7e5d0a2b83';
const COMPLETED_AT = new Date('2026-03-14T18:30:00.000Z');

const FRANKFURT_CITY = '11111111-1111-4111-8111-111111111111';
const PARIS_CITY = '22222222-2222-4222-8222-222222222222';
const BRUSSELS_CITY = '33333333-3333-4333-8333-333333333333';

const AIRPORTS: Record<
  string,
  { icaoCode: string; cityId: string; name: string }
> = {
  'aa3b1e77-0f42-4c8d-9e15-6b2a7c9d0e31': {
    icaoCode: 'EDDF',
    cityId: FRANKFURT_CITY,
    name: 'Frankfurt',
  },
  'bb7d2c19-5a63-4f0e-8c24-7d3b8e1f2a45': {
    icaoCode: 'EDFH',
    cityId: FRANKFURT_CITY,
    name: 'Frankfurt',
  },
  'cc9e4a02-6b18-4d7f-91a3-8e4c9f2b3d56': {
    icaoCode: 'LFPG',
    cityId: PARIS_CITY,
    name: 'Paris',
  },
  'dd1f6b53-7c29-4e80-a2b4-9f5d0a3c4e67': {
    icaoCode: 'EBBR',
    cityId: BRUSSELS_CITY,
    name: 'Brussels',
  },
};

const FRANKFURT = 'aa3b1e77-0f42-4c8d-9e15-6b2a7c9d0e31';
const FRANKFURT_HAHN = 'bb7d2c19-5a63-4f0e-8c24-7d3b8e1f2a45';
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

describe('CityVisitListener', () => {
  let record: jest.Mock;
  let countVisitsToCity: jest.Mock;
  let cacheDel: jest.Mock;
  let awarded: AwardPostcardCommand[];
  let completion: { captainId: string | null; completedAt: Date | null };
  let listener: CityVisitListener;

  beforeEach(() => {
    record = jest.fn();
    countVisitsToCity = jest.fn().mockResolvedValue(1);
    cacheDel = jest.fn();
    awarded = [];
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
            city: { id: airport.cityId, name: airport.name },
          });
        }

        throw new Error('unexpected query');
      }),
    };

    const commandBus = {
      execute: jest.fn().mockImplementation((command: unknown) => {
        if (command instanceof AwardPostcardCommand) {
          awarded.push(command);
          return Promise.resolve();
        }

        return handler.execute(command as never);
      }),
    };

    const handler = new RecordCityVisitHandler(
      { del: cacheDel } as never,
      queryBus as never,
      commandBus as never,
      { record, countVisitsToCity } as unknown as UserCityVisitRepository,
    );

    listener = new CityVisitListener(queryBus as never, commandBus as never);
  });

  function visitedCities(): string[] {
    return record.mock.calls.map((call: unknown[]) => call[2] as string);
  }

  it('records the city the pilot landed in and no other', async () => {
    await listener.onOnBlockWasReported(arrivalAt(PARIS));

    expect(visitedCities()).toEqual([PARIS_CITY]);
  });

  it('records a flight between two airports of one city exactly once', async () => {
    await listener.onOnBlockWasReported(arrivalAt(FRANKFURT_HAHN));

    expect(visitedCities()).toEqual([FRANKFURT_CITY]);
  });

  it('records where a diverted flight actually landed', async () => {
    await listener.onOnBlockWasReported(arrivalAt(BRUSSELS));

    expect(visitedCities()).toEqual([BRUSSELS_CITY]);
  });

  it('records the flight, the airport and the completion moment', async () => {
    await listener.onOnBlockWasReported(arrivalAt(PARIS));

    expect(record).toHaveBeenCalledWith(
      expect.any(String),
      CAPTAIN_ID,
      PARIS_CITY,
      FLIGHT_ID,
      PARIS,
      COMPLETED_AT,
    );
  });

  it('awards the city postcard on a first arrival', async () => {
    countVisitsToCity.mockResolvedValue(1);

    await listener.onOnBlockWasReported(arrivalAt(PARIS));

    expect(awarded).toEqual([
      new AwardPostcardCommand(CAPTAIN_ID, PARIS_CITY, COMPLETED_AT),
    ]);
  });

  it('awards nothing when the pilot has been to that city before', async () => {
    countVisitsToCity.mockResolvedValue(4);

    await listener.onOnBlockWasReported(arrivalAt(PARIS));

    expect(awarded).toEqual([]);
    expect(visitedCities()).toEqual([PARIS_CITY]);
  });

  it('records nothing for a flight with no captain', async () => {
    completion = { captainId: null, completedAt: COMPLETED_AT };

    await listener.onOnBlockWasReported(arrivalAt(PARIS));

    expect(record).not.toHaveBeenCalled();
    expect(awarded).toEqual([]);
  });

  it('records nothing for a flight that has not completed', async () => {
    completion = { captainId: CAPTAIN_ID, completedAt: null };

    await listener.onOnBlockWasReported(arrivalAt(PARIS));

    expect(record).not.toHaveBeenCalled();
    expect(awarded).toEqual([]);
  });

  it('invalidates the cached visited-cities read', async () => {
    await listener.onOnBlockWasReported(arrivalAt(PARIS));

    const busted = cacheDel.mock.calls.map((call: string[]) => call[0]);

    expect(busted).toContain(`user:${CAPTAIN_ID}:stats-cities`);
  });
});
