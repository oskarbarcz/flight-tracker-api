import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { GetFlightQuery } from '../query/get-flight.query';
import { FlightStatus } from '../../model/flight.model';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  FlightDoesNotExistError,
  InvalidStatusToChangeScheduleError,
} from '../../infra/http/request/errors.dto';
import { FlightsRepository } from '../../infra/database/repository/flights.repository';
import { ScheduledTimesheetWasUpdatedEvent } from '../../../../core/domain/events/dto/flight.events';
import { FlightEventScope } from '../../model/event.model';
import { DomainEventEmitter } from '../../../../core/domain/events/domain-event-emitter';
import { FullTimesheet, Schedule } from '../../model/timesheet.model';

export class UpdateScheduledTimesheetCommand {
  constructor(
    public readonly flightId: string,
    public readonly initiatorId: string,
    public readonly schedule: Schedule,
  ) {}
}

@CommandHandler(UpdateScheduledTimesheetCommand)
export class UpdateScheduledTimesheetHandler implements ICommandHandler<UpdateScheduledTimesheetCommand> {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly flightsRepository: FlightsRepository,
    private readonly domainEvents: DomainEventEmitter,
  ) {}

  async execute(command: UpdateScheduledTimesheetCommand): Promise<void> {
    const { flightId, initiatorId, schedule } = command;
    const query = new GetFlightQuery(flightId);
    const flight = await this.queryBus.execute(query);

    if (!flight) {
      throw new NotFoundException(FlightDoesNotExistError);
    }

    if (flight.status !== FlightStatus.Created) {
      throw new UnprocessableEntityException(
        InvalidStatusToChangeScheduleError,
      );
    }

    const timesheet: FullTimesheet = { scheduled: schedule };
    await this.flightsRepository.updateTimesheet(flightId, timesheet);
    this.domainEvents.emit(
      new ScheduledTimesheetWasUpdatedEvent({
        flightId,
        rotationId: flight.rotationId,
        scope: FlightEventScope.Operations,
        actorId: initiatorId,
      }),
    );
  }
}
