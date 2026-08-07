import {
  FlightDoesNotExistError,
  InvalidStatusToChangeServiceTypeError,
} from '../../model/error/flight.error';
import {
  UpdateFlightCommand,
  UpdateFlightHandler,
} from './update-flight.command';
import { FlightServiceType, FlightStatus } from '../../model/flight.model';

const FLIGHT_ID = 'e91e13a9-09d8-48bf-8453-283cef467b88';

function createdFlight() {
  return {
    id: FLIGHT_ID,
    status: FlightStatus.Created,
    serviceType: FlightServiceType.Passenger,
  };
}

describe('UpdateFlightHandler', () => {
  let queryBus: { execute: jest.Mock };
  let flightsRepository: { updateServiceType: jest.Mock };
  let cacheManager: { del: jest.Mock };
  let handler: UpdateFlightHandler;

  beforeEach(() => {
    queryBus = { execute: jest.fn().mockResolvedValue(createdFlight()) };
    flightsRepository = { updateServiceType: jest.fn() };
    cacheManager = { del: jest.fn() };
    handler = new UpdateFlightHandler(
      queryBus as never,
      flightsRepository as never,
      cacheManager as never,
    );
  });

  it('changes the service type of a flight in created status', async () => {
    const command = new UpdateFlightCommand(FLIGHT_ID, FlightServiceType.Cargo);

    await handler.execute(command);

    expect(flightsRepository.updateServiceType).toHaveBeenCalledWith(
      FLIGHT_ID,
      FlightServiceType.Cargo,
    );
  });

  it('evicts the cached flight body after the write', async () => {
    const command = new UpdateFlightCommand(FLIGHT_ID, FlightServiceType.Cargo);

    await handler.execute(command);

    expect(cacheManager.del).toHaveBeenCalled();
    expect(
      cacheManager.del.mock.calls.every(([key]) =>
        String(key).includes(FLIGHT_ID),
      ),
    ).toBe(true);
  });

  it('rejects a service type change once the flight left created status', async () => {
    queryBus.execute.mockResolvedValue({
      ...createdFlight(),
      status: FlightStatus.Ready,
    });

    await expect(
      handler.execute(
        new UpdateFlightCommand(FLIGHT_ID, FlightServiceType.Cargo),
      ),
    ).rejects.toBeInstanceOf(InvalidStatusToChangeServiceTypeError);
    expect(flightsRepository.updateServiceType).not.toHaveBeenCalled();
    expect(cacheManager.del).not.toHaveBeenCalled();
  });

  it('rejects an update for a flight that does not exist', async () => {
    queryBus.execute.mockResolvedValue(null);

    await expect(
      handler.execute(
        new UpdateFlightCommand(FLIGHT_ID, FlightServiceType.Cargo),
      ),
    ).rejects.toBeInstanceOf(FlightDoesNotExistError);
    expect(flightsRepository.updateServiceType).not.toHaveBeenCalled();
  });

  it('writes nothing when no attribute is supplied', async () => {
    await handler.execute(new UpdateFlightCommand(FLIGHT_ID));

    expect(flightsRepository.updateServiceType).not.toHaveBeenCalled();
    expect(cacheManager.del).not.toHaveBeenCalled();
  });

  it('accepts an empty update for a flight that already left created status', async () => {
    queryBus.execute.mockResolvedValue({
      ...createdFlight(),
      status: FlightStatus.Closed,
    });

    await expect(
      handler.execute(new UpdateFlightCommand(FLIGHT_ID)),
    ).resolves.toBeUndefined();
    expect(flightsRepository.updateServiceType).not.toHaveBeenCalled();
  });
});
