import { UnprocessableEntityException } from '@nestjs/common';
import {
  ReportTakeoffCommand,
  ReportTakeoffHandler,
} from './report-takeoff.command';
import { FlightStatus } from '../../model/flight.model';
import {
  FlightEventScope,
  TakeoffWasReportedEvent,
} from '../../../../core/domain/events/dto/flight.events';

const FLIGHT_ID = '7105891a-8008-4b47-b473-c81c97615ad7';

function taxiingOutFlight() {
  return {
    id: FLIGHT_ID,
    status: FlightStatus.TaxiingOut,
    rotationId: null,
    timesheet: {
      actual: {
        offBlockTime: new Date('2025-01-01T13:10:00.000Z'),
        takeoffTime: null,
        arrivalTime: null,
        onBlockTime: null,
      },
    },
  };
}

describe('ReportTakeoffHandler', () => {
  let queryBus: { execute: jest.Mock };
  let flightsRepository: {
    updateStatus: jest.Mock;
    updateTimesheet: jest.Mock;
  };
  let domainEvents: { emit: jest.Mock };
  let handler: ReportTakeoffHandler;

  beforeEach(() => {
    queryBus = { execute: jest.fn().mockResolvedValue(taxiingOutFlight()) };
    flightsRepository = {
      updateStatus: jest.fn(),
      updateTimesheet: jest.fn(),
    };
    domainEvents = { emit: jest.fn() };
    handler = new ReportTakeoffHandler(
      queryBus as never,
      flightsRepository as never,
      domainEvents as never,
    );
  });

  it('reports a manual takeoff as a user-scoped event flagged not automatic', async () => {
    const command = new ReportTakeoffCommand(FLIGHT_ID, 'actor-1');

    await handler.execute(command);

    expect(flightsRepository.updateStatus).toHaveBeenCalledWith(
      FLIGHT_ID,
      FlightStatus.InCruise,
    );
    const event = domainEvents.emit.mock.calls[0][0] as TakeoffWasReportedEvent;
    expect(event).toBeInstanceOf(TakeoffWasReportedEvent);
    expect(event.payload.scope).toBe(FlightEventScope.User);
    expect(event.payload.actorId).toBe('actor-1');
    expect(event.payload.payload).toEqual({ automaticallyDetected: false });
  });

  it('reports an automatic takeoff as an operations-scoped event with no actor and the backdated time', async () => {
    const takeoffTime = new Date('2025-01-01T13:14:00.000Z');
    const command = new ReportTakeoffCommand(
      FLIGHT_ID,
      null,
      takeoffTime,
      true,
    );

    await handler.execute(command);

    const timesheet = flightsRepository.updateTimesheet.mock.calls[0][1];
    expect(timesheet.actual.takeoffTime).toEqual(takeoffTime);

    const event = domainEvents.emit.mock.calls[0][0] as TakeoffWasReportedEvent;
    expect(event.payload.scope).toBe(FlightEventScope.Operations);
    expect(event.payload.actorId).toBeNull();
    expect(event.payload.payload).toEqual({ automaticallyDetected: true });
  });

  it('rejects takeoff when the flight is not taxiing out', async () => {
    queryBus.execute.mockResolvedValue({
      ...taxiingOutFlight(),
      status: FlightStatus.InCruise,
    });

    await expect(
      handler.execute(new ReportTakeoffCommand(FLIGHT_ID, 'actor-1')),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
    expect(domainEvents.emit).not.toHaveBeenCalled();
  });
});
