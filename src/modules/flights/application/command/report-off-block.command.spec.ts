import { InvalidStatusToReportOffBlockError } from '../../model/error/flight.error';
import {
  ReportOffBlockCommand,
  ReportOffBlockHandler,
} from './report-off-block.command';
import { FlightStatus } from '../../model/flight.model';
import {
  FlightEventScope,
  OffBlockWasReportedEvent,
} from '../../../../core/domain/events/dto/flight.events';

const FLIGHT_ID = '7105891a-8008-4b47-b473-c81c97615ad7';
const AIRCRAFT_ID = 'ffe14007-9147-40a1-a228-573c9c87a2e7';

function boardingFinishedFlight() {
  return {
    id: FLIGHT_ID,
    status: FlightStatus.BoardingFinished,
    aircraft: { id: AIRCRAFT_ID },
    timesheet: {
      actual: {
        offBlockTime: null,
        takeoffTime: null,
        arrivalTime: null,
        onBlockTime: null,
      },
    },
  };
}

describe('ReportOffBlockHandler', () => {
  let queryBus: { execute: jest.Mock };
  let flightsRepository: {
    updateStatus: jest.Mock;
    updateTimesheet: jest.Mock;
  };
  let domainEvents: { emit: jest.Mock };
  let handler: ReportOffBlockHandler;

  beforeEach(() => {
    queryBus = {
      execute: jest.fn().mockResolvedValue(boardingFinishedFlight()),
    };
    flightsRepository = {
      updateStatus: jest.fn(),
      updateTimesheet: jest.fn(),
    };
    domainEvents = { emit: jest.fn() };
    handler = new ReportOffBlockHandler(
      queryBus as never,
      flightsRepository as never,
      domainEvents as never,
    );
  });

  it('reports a manual off-block as a user-scoped event flagged not automatic', async () => {
    const command = new ReportOffBlockCommand(FLIGHT_ID, 'actor-1');

    await handler.execute(command);

    expect(flightsRepository.updateStatus).toHaveBeenCalledWith(
      FLIGHT_ID,
      FlightStatus.TaxiingOut,
    );
    const event = domainEvents.emit.mock
      .calls[0][0] as OffBlockWasReportedEvent;
    expect(event).toBeInstanceOf(OffBlockWasReportedEvent);
    expect(event.payload.scope).toBe(FlightEventScope.User);
    expect(event.payload.actorId).toBe('actor-1');
    expect(event.payload.aircraftId).toBe(AIRCRAFT_ID);
    expect(event.payload.payload).toEqual({ automaticallyDetected: false });
  });

  it('reports an automatic off-block as an operations-scoped event with no actor and the backdated time', async () => {
    const offBlockTime = new Date('2025-01-01T13:02:00.000Z');
    const command = new ReportOffBlockCommand(
      FLIGHT_ID,
      null,
      offBlockTime,
      true,
    );

    await handler.execute(command);

    const timesheet = flightsRepository.updateTimesheet.mock.calls[0][1];
    expect(timesheet.actual.offBlockTime).toEqual(offBlockTime);

    const event = domainEvents.emit.mock
      .calls[0][0] as OffBlockWasReportedEvent;
    expect(event.payload.scope).toBe(FlightEventScope.Operations);
    expect(event.payload.actorId).toBeNull();
    expect(event.payload.payload).toEqual({ automaticallyDetected: true });
  });

  it('rejects off-block when the flight has not finished boarding', async () => {
    queryBus.execute.mockResolvedValue({
      ...boardingFinishedFlight(),
      status: FlightStatus.BoardingStarted,
    });

    await expect(
      handler.execute(new ReportOffBlockCommand(FLIGHT_ID, 'actor-1')),
    ).rejects.toBeInstanceOf(InvalidStatusToReportOffBlockError);
    expect(domainEvents.emit).not.toHaveBeenCalled();
  });
});
