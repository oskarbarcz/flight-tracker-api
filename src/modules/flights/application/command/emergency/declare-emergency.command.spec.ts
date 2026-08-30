import {
  DeclareEmergencyCommand,
  DeclareEmergencyHandler,
} from './declare-emergency.command';
import { GetFlightQuery } from '../../query/get-flight.query';
import { GetCurrentLoadsheetQuery } from '../../query/get-current-loadsheet.query';
import { FlightStatus } from '../../../model/flight.model';
import { LoadsheetKind } from '../../../model/loadsheet.model';
import { LoadsheetMissingError } from '../../../model/error/flight.error';
import { GetFlightCargoLoadQuery } from '../../../../manifest/application/query/get-flight-cargo-load.query';
import { CargoManifestNotGeneratedError } from '../../../../manifest/model/error/cargo.error';

const FLIGHT_ID = 'b3899775-278e-4496-add1-21385a13d93e';
const ACTOR_ID = 'fcf6f4bc-290d-43a9-843c-409cd47e143d';

function crewedLoadsheet(passengers: number) {
  return {
    passengers,
    flightCrew: { pilots: 2, reliefPilots: 1, cabinCrew: 5 },
  };
}

function declaration() {
  return new DeclareEmergencyCommand(
    FLIGHT_ID,
    { sub: ACTOR_ID } as never,
    {
      urgency: 'mayday',
      threatLevel: 'critical',
      category: 'technical',
      intention: 'divert',
      fuelEnduranceMinutes: 90,
      dangerousGoodsOnBoard: [],
      freeText: 'engine failure',
    } as never,
  );
}

function handlerFor(loadsheets: { final?: unknown; preliminary?: unknown }): {
  handler: DeclareEmergencyHandler;
  repository: { hasUnresolved: jest.Mock; create: jest.Mock };
} {
  const queryBus = {
    execute: jest.fn().mockImplementation((query: unknown) => {
      if (query instanceof GetFlightQuery) {
        return Promise.resolve({
          id: FLIGHT_ID,
          status: FlightStatus.InCruise,
        });
      }

      if (query instanceof GetCurrentLoadsheetQuery) {
        return Promise.resolve(
          query.kind === LoadsheetKind.Final
            ? (loadsheets.final ?? null)
            : (loadsheets.preliminary ?? null),
        );
      }

      if (query instanceof GetFlightCargoLoadQuery) {
        return Promise.reject(new CargoManifestNotGeneratedError());
      }

      return Promise.reject(new Error('unexpected query'));
    }),
  };

  const repository = {
    hasUnresolved: jest.fn().mockResolvedValue(false),
    create: jest.fn().mockResolvedValue({ id: 'emergency-1' }),
  };

  const handler = new DeclareEmergencyHandler(
    queryBus as never,
    repository as never,
    { emitAsync: jest.fn() } as never,
  );

  return { handler, repository };
}

describe('DeclareEmergencyHandler souls on board', () => {
  it('counts the final loadsheet where the flight has one', async () => {
    const { handler, repository } = handlerFor({
      final: crewedLoadsheet(288),
      preliminary: crewedLoadsheet(292),
    });

    await handler.execute(declaration());

    expect(repository.create.mock.calls[0][1].soulsOnBoard).toBe(296);
  });

  it('counts the current preliminary loadsheet where there is no final one', async () => {
    const { handler, repository } = handlerFor({
      preliminary: crewedLoadsheet(292),
    });

    await handler.execute(declaration());

    expect(repository.create.mock.calls[0][1].soulsOnBoard).toBe(300);
  });

  it('refuses a flight that has no loadsheet at all', async () => {
    const { handler, repository } = handlerFor({});

    await expect(handler.execute(declaration())).rejects.toThrow(
      LoadsheetMissingError,
    );
    expect(repository.create).not.toHaveBeenCalled();
  });
});
