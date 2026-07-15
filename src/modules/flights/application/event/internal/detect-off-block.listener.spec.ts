import { DetectOffBlockListener } from './detect-off-block.listener';
import { ReportOffBlockCommand } from '../../command/report-off-block.command';
import { FlightStatus } from '../../../model/flight.model';
import {
  FlightEventScope,
  FlightPathWasUpdatedEvent,
} from '../../../../../core/domain/events/dto/flight.events';

const FLIGHT_ID = '7105891a-8008-4b47-b473-c81c97615ad7';

const stationaryPoint = {
  date: new Date('2025-01-01T13:00:00.000Z'),
  groundSpeed: 0,
};
const secondStationaryPoint = {
  date: new Date('2025-01-01T13:01:00.000Z'),
  groundSpeed: 2,
};
const firstMovingPoint = {
  date: new Date('2025-01-01T13:02:00.000Z'),
  groundSpeed: 12,
};
const secondMovingPoint = {
  date: new Date('2025-01-01T13:03:00.000Z'),
  groundSpeed: 25,
};

function flight(overrides: Record<string, unknown> = {}) {
  return {
    id: FLIGHT_ID,
    status: FlightStatus.BoardingFinished,
    rotationId: null,
    ...overrides,
  };
}

describe('DetectOffBlockListener', () => {
  let queryBus: { execute: jest.Mock };
  let commandBus: { execute: jest.Mock };
  let flightsRepository: { getFlightPath: jest.Mock };
  let listener: DetectOffBlockListener;

  beforeEach(() => {
    queryBus = { execute: jest.fn() };
    commandBus = { execute: jest.fn() };
    flightsRepository = { getFlightPath: jest.fn() };
    listener = new DetectOffBlockListener(
      queryBus as never,
      commandBus as never,
      flightsRepository as never,
    );
  });

  const event = new FlightPathWasUpdatedEvent({
    flightId: FLIGHT_ID,
    rotationId: null,
    scope: FlightEventScope.System,
    actorId: null,
  });

  it('reports off-block with the first moving position timestamp when the aircraft starts rolling', async () => {
    queryBus.execute.mockResolvedValue(flight());
    flightsRepository.getFlightPath.mockResolvedValue([
      stationaryPoint,
      secondStationaryPoint,
      firstMovingPoint,
      secondMovingPoint,
    ]);

    await listener.onFlightPathWasUpdated(event);

    expect(commandBus.execute).toHaveBeenCalledTimes(1);
    const command = commandBus.execute.mock
      .calls[0][0] as ReportOffBlockCommand;
    expect(command).toBeInstanceOf(ReportOffBlockCommand);
    expect(command.flightId).toBe(FLIGHT_ID);
    expect(command.initiatorId).toBeNull();
    expect(command.automaticallyDetected).toBe(true);
    expect(command.offBlockTime).toEqual(firstMovingPoint.date);
  });

  it('does nothing when the flight has not finished boarding', async () => {
    queryBus.execute.mockResolvedValue(
      flight({ status: FlightStatus.TaxiingOut }),
    );

    await listener.onFlightPathWasUpdated(event);

    expect(flightsRepository.getFlightPath).not.toHaveBeenCalled();
    expect(commandBus.execute).not.toHaveBeenCalled();
  });

  it('does nothing when every stored position is at or below the threshold', async () => {
    queryBus.execute.mockResolvedValue(flight());
    flightsRepository.getFlightPath.mockResolvedValue([
      stationaryPoint,
      secondStationaryPoint,
    ]);

    await listener.onFlightPathWasUpdated(event);

    expect(commandBus.execute).not.toHaveBeenCalled();
  });
});
