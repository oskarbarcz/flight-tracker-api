import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { GetFlightQuery } from '../query/get-flight.query';
import { FlightStatus } from '../../model/flight.model';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  FlightDoesNotExistError,
  InvalidStatusToCheckInError,
} from '../../infra/http/request/errors.dto';
import { FlightsRepository } from '../../infra/database/repository/flights.repository';
import { PilotCheckedInEvent } from '../../../../core/domain/events/dto/flight.events';
import { FlightEventScope } from '../../model/event.model';
import { DomainEventEmitter } from '../../../../core/domain/events/domain-event-emitter';
import { Schedule } from '../../model/timesheet.model';

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
    private readonly domainEvents: DomainEventEmitter,
  ) {}

  async execute(command: CheckInPilotCommand): Promise<void> {
    const { flightId, initiatorId, estimatedSchedule } = command;
    const query = new GetFlightQuery(flightId);
    const flight = await this.queryBus.execute(query);

    if (!flight) {
      throw new NotFoundException(FlightDoesNotExistError);
    }

    if (flight.status !== FlightStatus.Ready) {
      throw new UnprocessableEntityException(InvalidStatusToCheckInError);
    }

    const timesheet = flight.timesheet;
    timesheet.estimated = estimatedSchedule;

    await Promise.all([
      await this.flightsRepository.checkInCaptain(flightId, initiatorId),
      await this.flightsRepository.updateStatus(
        flightId,
        FlightStatus.CheckedIn,
      ),
      await this.flightsRepository.updateTimesheet(flightId, timesheet),
    ]);

    this.domainEvents.emit(
      new PilotCheckedInEvent({
        flightId,
        rotationId: flight.rotationId,
        scope: FlightEventScope.User,
        actorId: initiatorId,
        aircraftId: flight.aircraft.id,
      }),
    );
  }
}
