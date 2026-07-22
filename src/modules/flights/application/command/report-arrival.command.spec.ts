import { InvalidStatusToReportArrivedError } from '../../model/error/flight.error';
import {
  ReportArrivalCommand,
  ReportArrivalHandler,
} from './report-arrival.command';
import { FlightStatus } from '../../model/flight.model';
import {
  ArrivalWasReportedEvent,
  FlightEventScope,
} from '../../../../core/domain/events/dto/flight.events';

const FLIGHT_ID = '7105891a-8008-4b47-b473-c81c97615ad7';

function inCruiseFlight() {
  return {
    id: FLIGHT_ID,
    status: FlightStatus.InCruise,
    timesheet: {
      actual: {
        offBlockTime: new Date('2025-01-01T13:10:00.000Z'),
        takeoffTime: new Date('2025-01-01T13:25:00.000Z'),
        arrivalTime: null,
        onBlockTime: null,
      },
    },
  };
}

describe('ReportArrivalHandler', () => {
  let queryBus: { execute: jest.Mock };
  let flightsRepository: {
    updateStatus: jest.Mock;
    updateTimesheet: jest.Mock;
  };
  let domainEvents: { emit: jest.Mock };
  let handler: ReportArrivalHandler;

  beforeEach(() => {
    queryBus = {
      execute: jest.fn().mockResolvedValue(inCruiseFlight()),
    };
    flightsRepository = {
      updateStatus: jest.fn(),
      updateTimesheet: jest.fn(),
    };
    domainEvents = { emit: jest.fn() };
    handler = new ReportArrivalHandler(
      queryBus as never,
      flightsRepository as never,
      domainEvents as never,
    );
  });

  it('reports a manual arrival as a user-scoped event flagged not automatic', async () => {
    const before = Date.now();
    const command = new ReportArrivalCommand(FLIGHT_ID, 'actor-1');

    await handler.execute(command);

    expect(flightsRepository.updateStatus).toHaveBeenCalledWith(
      FLIGHT_ID,
      FlightStatus.TaxiingIn,
    );
    const timesheet = flightsRepository.updateTimesheet.mock.calls[0][1];
    expect(timesheet.actual.arrivalTime.getTime()).toBeGreaterThanOrEqual(
      before,
    );

    const event = domainEvents.emit.mock.calls[0][0] as ArrivalWasReportedEvent;
    expect(event).toBeInstanceOf(ArrivalWasReportedEvent);
    expect(event.payload.scope).toBe(FlightEventScope.User);
    expect(event.payload.actorId).toBe('actor-1');
    expect(event.payload.payload).toEqual({ automaticallyDetected: false });
  });

  it('reports an automatic arrival as an operations-scoped event with no actor and the backdated time', async () => {
    const arrivalTime = new Date('2025-01-01T15:50:00.000Z');
    const command = new ReportArrivalCommand(
      FLIGHT_ID,
      null,
      arrivalTime,
      true,
    );

    await handler.execute(command);

    const timesheet = flightsRepository.updateTimesheet.mock.calls[0][1];
    expect(timesheet.actual.arrivalTime).toEqual(arrivalTime);

    const event = domainEvents.emit.mock.calls[0][0] as ArrivalWasReportedEvent;
    expect(event.payload.scope).toBe(FlightEventScope.Operations);
    expect(event.payload.actorId).toBeNull();
    expect(event.payload.payload).toEqual({ automaticallyDetected: true });
  });

  it('rejects arrival when the flight is not in cruise', async () => {
    queryBus.execute.mockResolvedValue({
      ...inCruiseFlight(),
      status: FlightStatus.TaxiingOut,
    });

    await expect(
      handler.execute(new ReportArrivalCommand(FLIGHT_ID, 'actor-1')),
    ).rejects.toBeInstanceOf(InvalidStatusToReportArrivedError);
    expect(domainEvents.emit).not.toHaveBeenCalled();
  });
});
