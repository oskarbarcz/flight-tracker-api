import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { GetFlightByIdQuery } from '../query/get-flight-by-id.query';
import { FlightStatus } from '../../entity/flight.entity';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  FlightDoesNotExistError,
  InvalidStatusToCheckInError,
} from '../../dto/errors.dto';
import { FlightsRepository } from '../../repository/flights.repository';
import { NewFlightEvent } from '../../dto/event.dto';
import { FlightEventType } from '../../../../core/events/flight';
import { FlightEventScope } from '../../entity/event.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Schedule } from '../../entity/timesheet.entity';

export class CheckInPilotCommand {
  constructor(
    public readonly flightId: string,
    public readonly initiatorId: string,
    public readonly estimatedSchedule: Schedule,
  ) {}
}

@CommandHandler(CheckInPilotCommand)
export class CheckInPilotForFlightHandler implements ICommandHandler<CheckInPilotCommand> {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly flightsRepository: FlightsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: CheckInPilotCommand): Promise<void> {
    const { flightId, initiatorId, estimatedSchedule } = command;
    const query = new GetFlightByIdQuery(flightId);
    const flight = await this.queryBus.execute(query);

    if (!flight) {
      throw new NotFoundException(FlightDoesNotExistError);
    }

    if (flight.status !== FlightStatus.Ready) {
      throw new UnprocessableEntityException(InvalidStatusToCheckInError);
    }

    const timesheet = flight.timesheet;
    timesheet.estimated = estimatedSchedule;

    await this.flightsRepository.updateStatus(flightId, FlightStatus.CheckedIn);
    await this.flightsRepository.updateTimesheet(flightId, timesheet);

    const event: NewFlightEvent = {
      flightId,
      rotationId: flight.rotationId,
      type: FlightEventType.PilotCheckedIn,
      scope: FlightEventScope.User,
      actorId: initiatorId,
    };
    this.eventEmitter.emit(FlightEventType.PilotCheckedIn, event);
  }
}
