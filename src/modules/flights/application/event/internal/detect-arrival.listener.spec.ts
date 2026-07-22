import { DetectArrivalListener } from './detect-arrival.listener';
import { ReportArrivalCommand } from '../../command/report-arrival.command';
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

const approachingInside = {
  latitude: 5,
  longitude: 5,
  groundSpeed: 140,
  date: new Date('2025-01-01T15:00:00.000Z'),
};
const slowedInside = {
  latitude: 6,
  longitude: 5,
  groundSpeed: 25,
  date: new Date('2025-01-01T15:03:00.000Z'),
};
const slowedOutside = {
  latitude: 50,
  longitude: 50,
  groundSpeed: 25,
  date: new Date('2025-01-01T14:30:00.000Z'),
};

function flight(overrides: Record<string, unknown> = {}) {
  return {
    id: FLIGHT_ID,
    status: FlightStatus.InCruise,
    airports: [
      { type: AirportType.Departure, shape: PERIMETER },
      { type: AirportType.Destination, shape: PERIMETER },
    ],
    ...overrides,
  };
}

describe('DetectArrivalListener', () => {
  let queryBus: { execute: jest.Mock };
  let commandBus: { execute: jest.Mock };
  let flightsRepository: { getFlightPath: jest.Mock };
  let listener: DetectArrivalListener;

  beforeEach(() => {
    queryBus = { execute: jest.fn() };
    commandBus = { execute: jest.fn() };
    flightsRepository = { getFlightPath: jest.fn() };
    listener = new DetectArrivalListener(
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

  it('reports arrival with the first inside-and-slowed timestamp', async () => {
    queryBus.execute.mockResolvedValue(flight());
    flightsRepository.getFlightPath.mockResolvedValue([
      approachingInside,
      slowedInside,
    ]);

    await listener.onFlightPathWasUpdated(event);

    expect(commandBus.execute).toHaveBeenCalledTimes(1);
    const command = commandBus.execute.mock.calls[0][0] as ReportArrivalCommand;
    expect(command).toBeInstanceOf(ReportArrivalCommand);
    expect(command.flightId).toBe(FLIGHT_ID);
    expect(command.initiatorId).toBeNull();
    expect(command.automaticallyDetected).toBe(true);
    expect(command.arrivalTime).toEqual(slowedInside.date);
  });

  it('does nothing when the flight is not in cruise', async () => {
    queryBus.execute.mockResolvedValue(
      flight({ status: FlightStatus.TaxiingIn }),
    );

    await listener.onFlightPathWasUpdated(event);

    expect(flightsRepository.getFlightPath).not.toHaveBeenCalled();
    expect(commandBus.execute).not.toHaveBeenCalled();
  });

  it('does nothing when the destination airport has no boundary shape', async () => {
    queryBus.execute.mockResolvedValue(
      flight({
        airports: [
          { type: AirportType.Departure, shape: PERIMETER },
          { type: AirportType.Destination, shape: null },
        ],
      }),
    );

    await listener.onFlightPathWasUpdated(event);

    expect(flightsRepository.getFlightPath).not.toHaveBeenCalled();
    expect(commandBus.execute).not.toHaveBeenCalled();
  });

  it('does nothing when no position is both inside the perimeter and below the threshold', async () => {
    queryBus.execute.mockResolvedValue(flight());
    flightsRepository.getFlightPath.mockResolvedValue([
      approachingInside,
      slowedOutside,
    ]);

    await listener.onFlightPathWasUpdated(event);

    expect(commandBus.execute).not.toHaveBeenCalled();
  });
});
