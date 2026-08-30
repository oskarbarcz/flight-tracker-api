import { GenerateManifestsListener } from './generate-manifests.listener';
import { GetFlightQuery } from '../../../../flights/application/query/get-flight.query';
import { GetCurrentLoadsheetQuery } from '../../../../flights/application/query/get-current-loadsheet.query';
import { PreliminaryLoadsheetWasUpdatedEvent } from '../../../../../core/domain/events/dto/flight.events';
import { FlightEventScope } from '../../../../flights/model/event.model';
import {
  AirportType,
  Continent,
} from '../../../../airports/model/airport.model';
import { GenerateFlightManifestCommand } from '../../command/generate-flight-manifest.command';
import { GenerateFlightCargoManifestCommand } from '../../command/generate-flight-cargo-manifest.command';
import { IssueNotocCommand } from '../../command/issue-notoc.command';
import { NotocStageName } from '../../../model/notoc.model';

const FLIGHT_ID = '8c3a1d61-9e45-4fc8-8b7a-2d5f6a8c9e3b';
const AIRCRAFT_ID = '2f0b0b3c-6b5e-4a35-8f5e-9a2ac0f7f2a1';
const OPERATOR_ID = '1f630d38-ad24-47cc-950b-3783e71bbd10';
const ACTOR_ID = '629be07f-5e65-429a-9d69-d34b99185f50';

const LOADSHEET = {
  flightCrew: { pilots: 2, reliefPilots: 0, cabinCrew: 4 },
  passengers: 150,
  passengersByCabin: { business: 20, economy: 130 },
  cargo: 2.5,
  payload: 17.5,
  zeroFuelWeight: 68.4,
  blockFuel: 21.4,
};

const AIRPORTS = [
  {
    type: AirportType.Departure,
    iataCode: 'FRA',
    country: 'Germany',
    continent: Continent.Europe,
  },
  {
    type: AirportType.Destination,
    iataCode: 'LHR',
    country: 'United Kingdom',
    continent: Continent.Europe,
  },
];

function loadsheetWasUpdated(): PreliminaryLoadsheetWasUpdatedEvent {
  return new PreliminaryLoadsheetWasUpdatedEvent({
    flightId: FLIGHT_ID,
    scope: FlightEventScope.Operations,
    actorId: ACTOR_ID,
  });
}

describe('GenerateManifestsListener', () => {
  let queryBus: { execute: jest.Mock };
  let commandBus: { execute: jest.Mock };
  let listener: GenerateManifestsListener;
  let preliminary: typeof LOADSHEET | null;
  let airports: typeof AIRPORTS;

  beforeEach(() => {
    preliminary = LOADSHEET;
    airports = AIRPORTS;

    commandBus = { execute: jest.fn().mockResolvedValue(undefined) };
    queryBus = {
      execute: jest.fn().mockImplementation((query: unknown) => {
        if (query instanceof GetCurrentLoadsheetQuery) {
          return Promise.resolve(preliminary);
        }

        if (query instanceof GetFlightQuery) {
          return Promise.resolve({
            id: FLIGHT_ID,
            aircraft: { id: AIRCRAFT_ID },
            operator: { id: OPERATOR_ID, iataCode: 'LH' },
            airports,
            timesheet: {
              scheduled: {
                offBlockTime: '2025-01-01T12:00:00.000Z',
                onBlockTime: '2025-01-01T13:30:00.000Z',
              },
            },
          });
        }

        return Promise.reject(new Error('unexpected query'));
      }),
    };

    listener = new GenerateManifestsListener(
      queryBus as never,
      commandBus as never,
    );
  });

  it('seats the passengers the preliminary loadsheet reports', async () => {
    await listener.onPreliminaryLoadsheetWasUpdated(loadsheetWasUpdated());

    const command = commandBus.execute.mock
      .calls[0][0] as GenerateFlightManifestCommand;

    expect(command).toBeInstanceOf(GenerateFlightManifestCommand);
    expect(command.flightId).toBe(FLIGHT_ID);
    expect(command.aircraftId).toBe(AIRCRAFT_ID);
    expect(command.operatorId).toBe(OPERATOR_ID);
    expect(command.passengers).toBe(150);
    expect(command.passengersByCabin).toEqual({ business: 20, economy: 130 });
  });

  it('builds the cargo load between the flight airports', async () => {
    await listener.onPreliminaryLoadsheetWasUpdated(loadsheetWasUpdated());

    const command = commandBus.execute.mock
      .calls[1][0] as GenerateFlightCargoManifestCommand;

    expect(command).toBeInstanceOf(GenerateFlightCargoManifestCommand);
    expect(command.operatorIata).toBe('LH');
    expect(command.cargoTons).toBe(2.5);
    expect(command.payloadTons).toBe(17.5);
    expect(command.departure.iataCode).toBe('FRA');
    expect(command.arrival.iataCode).toBe('LHR');
    expect(command.flightHours).toBe(1.5);
  });

  it('issues the preliminary notification to captain', async () => {
    await listener.onPreliminaryLoadsheetWasUpdated(loadsheetWasUpdated());

    const command = commandBus.execute.mock.calls[2][0] as IssueNotocCommand;

    expect(command).toBeInstanceOf(IssueNotocCommand);
    expect(command.stage).toBe(NotocStageName.Preliminary);
    expect(command.unloadingAirport).toBe('LHR');
  });

  it('generates nothing when the flight has no preliminary loadsheet', async () => {
    preliminary = null;

    await listener.onPreliminaryLoadsheetWasUpdated(loadsheetWasUpdated());

    expect(commandBus.execute).not.toHaveBeenCalled();
  });

  it('stops after the seating when the flight has no airports', async () => {
    airports = [];

    await listener.onPreliminaryLoadsheetWasUpdated(loadsheetWasUpdated());

    expect(commandBus.execute).toHaveBeenCalledTimes(1);
  });
});
