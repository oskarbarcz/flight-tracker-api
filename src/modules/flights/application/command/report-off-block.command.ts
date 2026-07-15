import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { GetFlightQuery } from '../query/get-flight.query';
import { FlightStatus } from '../../model/flight.model';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  FlightDoesNotExistError,
  InvalidStatusToReportOffBlockError,
} from '../../infra/http/request/errors.dto';
import { FlightsRepository } from '../../infra/database/repository/flights.repository';
import { OffBlockWasReportedEvent } from '../../../../core/domain/events/dto/flight.events';
import { FlightEventScope } from '../../model/event.model';
import { DomainEventEmitter } from '../../../../core/domain/events/domain-event-emitter';

export class ReportOffBlockCommand {
  constructor(
    public readonly flightId: string,
    public readonly initiatorId: string | null = null,
    public readonly offBlockTime: Date = new Date(),
    public readonly automaticallyDetected: boolean = false,
  ) {}
}

@CommandHandler(ReportOffBlockCommand)
export class ReportOffBlockHandler implements ICommandHandler<ReportOffBlockCommand> {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly flightsRepository: FlightsRepository,
    private readonly domainEvents: DomainEventEmitter,
  ) {}

  async execute(command: ReportOffBlockCommand): Promise<void> {
    const { flightId, initiatorId, offBlockTime, automaticallyDetected } =
      command;
    const scope = automaticallyDetected
      ? FlightEventScope.Operations
      : FlightEventScope.User;
    const query = new GetFlightQuery(flightId);
    const flight = await this.queryBus.execute(query);

    if (!flight) {
      throw new NotFoundException(FlightDoesNotExistError);
    }

    if (flight.status !== FlightStatus.BoardingFinished) {
      throw new UnprocessableEntityException(
        InvalidStatusToReportOffBlockError,
      );
    }

    const timesheet = flight.timesheet;
    timesheet.actual = {
      offBlockTime,
      takeoffTime: null,
      arrivalTime: null,
      onBlockTime: null,
    };

    await this.flightsRepository.updateStatus(
      flightId,
      FlightStatus.TaxiingOut,
    );
    await this.flightsRepository.updateTimesheet(flightId, timesheet);

    this.domainEvents.emit(
      new OffBlockWasReportedEvent({
        flightId,
        rotationId: flight.rotationId,
        scope,
        actorId: initiatorId,
        aircraftId: flight.aircraft.id,
        payload: { automaticallyDetected },
      }),
    );
  }
}
