import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { GetFlightQuery } from '../query/get-flight.query';
import { FlightStatus } from '../../model/flight.model';
import {
  FlightDoesNotExistError,
  InvalidStatusToReportArrivedError,
} from '../../model/error/flight.error';
import { FlightsRepository } from '../../infra/database/repository/flights.repository';
import { ArrivalWasReportedEvent } from '../../../../core/domain/events/dto/flight.events';
import { FlightEventScope } from '../../model/event.model';
import { DomainEventEmitter } from '../../../../core/domain/events/domain-event-emitter';
import { Schedule } from '../../model/timesheet.model';

export class ReportArrivalCommand {
  constructor(
    public readonly flightId: string,
    public readonly initiatorId: string | null = null,
    public readonly arrivalTime: Date = new Date(),
    public readonly automaticallyDetected: boolean = false,
  ) {}
}

@CommandHandler(ReportArrivalCommand)
export class ReportArrivalHandler implements ICommandHandler<ReportArrivalCommand> {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly flightsRepository: FlightsRepository,
    private readonly domainEvents: DomainEventEmitter,
  ) {}

  async execute(command: ReportArrivalCommand): Promise<void> {
    const { flightId, initiatorId, arrivalTime, automaticallyDetected } =
      command;
    const scope = automaticallyDetected
      ? FlightEventScope.Operations
      : FlightEventScope.User;
    const query = new GetFlightQuery(flightId);
    const flight = await this.queryBus.execute(query);

    if (!flight) {
      throw new FlightDoesNotExistError();
    }

    if (flight.status !== FlightStatus.InCruise) {
      throw new InvalidStatusToReportArrivedError();
    }

    const timesheet = flight.timesheet as { actual: Schedule };
    timesheet.actual.arrivalTime = arrivalTime;

    await this.flightsRepository.updateStatus(flightId, FlightStatus.TaxiingIn);
    await this.flightsRepository.updateTimesheet(flightId, timesheet);

    this.domainEvents.emit(
      new ArrivalWasReportedEvent({
        flightId,
        rotationId: flight.rotationId,
        scope,
        actorId: initiatorId,
        payload: { automaticallyDetected },
      }),
    );
  }
}
