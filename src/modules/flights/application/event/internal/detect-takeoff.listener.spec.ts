import { DetectTakeoffListener } from './detect-takeoff.listener';
import { ReportTakeoffCommand } from '../../command/report-takeoff.command';
import { FlightStatus } from '../../../model/flight.model';
import { AirportType } from '../../../../airports/model/airport.model';
import {
  FlightEventScope,
  FlightPathWasUpdatedEvent,
} from '../../../../../core/domain/events/dto/flight.events';

const FLIGHT_ID = '7105891a-8008-4b47-b473-c81c97615ad7';

const PERIMETER = [
  { latitude: 0, longitude: 0 },
  { latitude: 0, longitude: 10 },
  { latitude: 10, longitude: 10 },
  { latitude: 10, longitude: 0 },
];

const insidePoint = {
  latitude: 5,
  longitude: 5,
  date: new Date('2025-01-01T13:11:00.000Z'),
};
const secondInsidePoint = {
  latitude: 6,
  longitude: 5,
  date: new Date('2025-01-01T13:12:00.000Z'),
};
const firstOutsidePoint = {
  latitude: 50,
  longitude: 50,
  date: new Date('2025-01-01T13:14:00.000Z'),
};
const secondOutsidePoint = {
  latitude: 60,
  longitude: 60,
  date: new Date('2025-01-01T13:16:00.000Z'),
};

function flight(overrides: Record<string, unknown> = {}) {
  return {
    id: FLIGHT_ID,
    status: FlightStatus.TaxiingOut,
    airports: [
      { type: AirportType.Departure, shape: PERIMETER },
      { type: AirportType.Destination, shape: PERIMETER },
    ],
    ...overrides,
  };
}

describe('DetectTakeoffListener', () => {
  let queryBus: { execute: jest.Mock };
  let commandBus: { execute: jest.Mock };
  let flightsRepository: { getFlightPath: jest.Mock };
  let listener: DetectTakeoffListener;

  beforeEach(() => {
    queryBus = { execute: jest.fn() };
    commandBus = { execute: jest.fn() };
    flightsRepository = { getFlightPath: jest.fn() };
    listener = new DetectTakeoffListener(
      queryBus as never,
      commandBus as never,
      flightsRepository as never,
    );
  });

  const event = new FlightPathWasUpdatedEvent({
    flightId: FLIGHT_ID,
    scope: FlightEventScope.System,
    actorId: null,
  });

  it('reports takeoff with the first out-of-boundary timestamp when the path leaves the perimeter', async () => {
    queryBus.execute.mockResolvedValue(flight());
    flightsRepository.getFlightPath.mockResolvedValue([
      insidePoint,
      secondInsidePoint,
      firstOutsidePoint,
      secondOutsidePoint,
    ]);

    await listener.onFlightPathWasUpdated(event);

    expect(commandBus.execute).toHaveBeenCalledTimes(1);
    const command = commandBus.execute.mock.calls[0][0] as ReportTakeoffCommand;
    expect(command).toBeInstanceOf(ReportTakeoffCommand);
    expect(command.flightId).toBe(FLIGHT_ID);
    expect(command.initiatorId).toBeNull();
    expect(command.automaticallyDetected).toBe(true);
    expect(command.takeoffTime).toEqual(firstOutsidePoint.date);
  });

  it('does nothing when the flight is not taxiing out', async () => {
    queryBus.execute.mockResolvedValue(
      flight({ status: FlightStatus.InCruise }),
    );

    await listener.onFlightPathWasUpdated(event);

    expect(flightsRepository.getFlightPath).not.toHaveBeenCalled();
    expect(commandBus.execute).not.toHaveBeenCalled();
  });

  it('does nothing when the departure airport has no boundary shape', async () => {
    queryBus.execute.mockResolvedValue(
      flight({
        airports: [
          { type: AirportType.Departure, shape: null },
          { type: AirportType.Destination, shape: PERIMETER },
        ],
      }),
    );

    await listener.onFlightPathWasUpdated(event);

    expect(flightsRepository.getFlightPath).not.toHaveBeenCalled();
    expect(commandBus.execute).not.toHaveBeenCalled();
  });

  it('does nothing when every stored position is inside the perimeter', async () => {
    queryBus.execute.mockResolvedValue(flight());
    flightsRepository.getFlightPath.mockResolvedValue([
      insidePoint,
      secondInsidePoint,
    ]);

    await listener.onFlightPathWasUpdated(event);

    expect(commandBus.execute).not.toHaveBeenCalled();
  });
});
