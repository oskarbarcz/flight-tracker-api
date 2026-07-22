import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { GetFlightQuery } from '../query/get-flight.query';
import { FlightStatus } from '../../model/flight.model';
import {
  FlightDoesNotExistError,
  InvalidStatusToReportTakenOffError,
} from '../../model/error/flight.error';
import { FlightsRepository } from '../../infra/database/repository/flights.repository';
import { TakeoffWasReportedEvent } from '../../../../core/domain/events/dto/flight.events';
import { FlightEventScope } from '../../model/event.model';
import { DomainEventEmitter } from '../../../../core/domain/events/domain-event-emitter';
import { Schedule } from '../../model/timesheet.model';

export class ReportTakeoffCommand {
  constructor(
    public readonly flightId: string,
    public readonly initiatorId: string | null = null,
    public readonly takeoffTime: Date = new Date(),
    public readonly automaticallyDetected: boolean = false,
  ) {}
}

@CommandHandler(ReportTakeoffCommand)
export class ReportTakeoffHandler implements ICommandHandler<ReportTakeoffCommand> {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly flightsRepository: FlightsRepository,
    private readonly domainEvents: DomainEventEmitter,
  ) {}

  async execute(command: ReportTakeoffCommand): Promise<void> {
    const { flightId, initiatorId, takeoffTime, automaticallyDetected } =
      command;
    const scope = automaticallyDetected
      ? FlightEventScope.Operations
      : FlightEventScope.User;
    const query = new GetFlightQuery(flightId);
    const flight = await this.queryBus.execute(query);

    if (!flight) {
      throw new FlightDoesNotExistError();
    }

    if (flight.status !== FlightStatus.TaxiingOut) {
      throw new InvalidStatusToReportTakenOffError();
    }

    const timesheet = flight.timesheet as { actual: Schedule };
    timesheet.actual.takeoffTime = takeoffTime;

    await this.flightsRepository.updateStatus(flightId, FlightStatus.InCruise);
    await this.flightsRepository.updateTimesheet(flightId, timesheet);

    this.domainEvents.emit(
      new TakeoffWasReportedEvent({
        flightId,
        scope,
        actorId: initiatorId,
        payload: { automaticallyDetected },
      }),
    );
  }
}
