import {
  UpdatePreliminaryLoadsheetCommand,
  UpdatePreliminaryLoadsheetHandler,
} from './update-preliminary-loadsheet.command';
import { FlightStatus } from '../../model/flight.model';
import { Loadsheet } from '../../model/loadsheet.model';
import { PayloadBelowLoadError } from '../../model/error/flight.error';

const FLIGHT_ID = '7105891a-8008-4b47-b473-c81c97615ad7';

function importedLoadsheet(passengerMass: number | null): Loadsheet {
  return {
    flightCrew: { pilots: 2, reliefPilots: 0, cabinCrew: 9 },
    passengers: 267,
    cargo: 1.2,
    payload: 22.6,
    zeroFuelWeight: 180,
    blockFuel: 40,
    passengerMass,
  } as Loadsheet;
}

function submitted(overrides: Partial<Loadsheet> = {}): Loadsheet {
  return { ...importedLoadsheet(null), ...overrides } as Loadsheet;
}

describe('UpdatePreliminaryLoadsheetHandler planned passenger mass', () => {
  let queryBus: { execute: jest.Mock };
  let flightsRepository: { updateLoadsheets: jest.Mock };
  let domainEvents: { emitAsync: jest.Mock };
  let handler: UpdatePreliminaryLoadsheetHandler;

  function flightPlannedAt(passengerMass: number | null) {
    return {
      id: FLIGHT_ID,
      status: FlightStatus.Created,
      aircraft: { id: 'aircraft-1' },
      loadsheets: {
        preliminary: importedLoadsheet(passengerMass),
        final: null,
      },
    };
  }

  function handlerFor(passengerMass: number | null) {
    queryBus = {
      execute: jest
        .fn()
        .mockResolvedValueOnce(flightPlannedAt(passengerMass))
        .mockResolvedValue(null),
    };
    flightsRepository = { updateLoadsheets: jest.fn() };
    domainEvents = { emitAsync: jest.fn() };

    return new UpdatePreliminaryLoadsheetHandler(
      queryBus as never,
      flightsRepository as never,
      domainEvents as never,
    );
  }

  it('accepts an imported loadsheet submitted back unchanged', async () => {
    handler = handlerFor(80);
    const command = new UpdatePreliminaryLoadsheetCommand(
      FLIGHT_ID,
      'actor-1',
      submitted(),
    );

    await handler.execute(command);

    const stored = flightsRepository.updateLoadsheets.mock.calls[0][1];
    expect(stored.preliminary.passengerMass).toBe(80);
  });

  it('measures the payload against the stored mass, not the one submitted', async () => {
    handler = handlerFor(null);
    const command = new UpdatePreliminaryLoadsheetCommand(
      FLIGHT_ID,
      'actor-1',
      submitted({ passengerMass: 10 }),
    );

    await expect(handler.execute(command)).rejects.toThrow(
      PayloadBelowLoadError,
    );
  });

  it('discards a mass the request supplies for a flight planned lighter', async () => {
    handler = handlerFor(80);
    const command = new UpdatePreliminaryLoadsheetCommand(
      FLIGHT_ID,
      'actor-1',
      submitted({ passengerMass: 200 }),
    );

    await handler.execute(command);

    const stored = flightsRepository.updateLoadsheets.mock.calls[0][1];
    expect(stored.preliminary.passengerMass).toBe(80);
  });
});
