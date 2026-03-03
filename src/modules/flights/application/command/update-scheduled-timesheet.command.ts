import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { GetFlightByIdQuery } from '../query/get-flight-by-id.query';
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
import { NewFlightEvent } from '../../infra/http/request/event.dto';
import { FlightEventType } from '../../../../core/events/flight';
import { FlightEventScope } from '../../model/event.model';
import { EventEmitter2 } from '@nestjs/event-emitter';
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
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: UpdateScheduledTimesheetCommand): Promise<void> {
    const { flightId, initiatorId, schedule } = command;
    const query = new GetFlightByIdQuery(flightId);
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
    const event: NewFlightEvent = {
      flightId,
      rotationId: flight.rotationId,
      type: FlightEventType.ScheduledTimesheetWasUpdated,
      scope: FlightEventScope.Operations,
      actorId: initiatorId,
    };
    this.eventEmitter.emit(FlightEventType.ScheduledTimesheetWasUpdated, event);
  }
}
