import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { GetFlightByIdQuery } from '../query/get-flight-by-id.query';
import { FlightStatus } from '../../model/flight.model';
import { UnprocessableEntityException } from '@nestjs/common';
import {
  InvalidStatusToMarkAsReadyError,
  PreliminaryLoadsheetMissingError,
} from '../../infra/http/request/errors.dto';
import { NewFlightEvent } from '../../infra/http/request/event.dto';
import { FlightEventType } from '../../../../core/events/flight';
import { FlightEventScope } from '../../model/event.model';
import { FlightsRepository } from '../../infra/database/repository/flights.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';

export class MarkAsReadyCommand {
  constructor(
    public readonly flightId: string,
    public readonly initiatorId: string,
  ) {}
}

@CommandHandler(MarkAsReadyCommand)
export class MarkFlightAsReadyHandler implements ICommandHandler<MarkAsReadyCommand> {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly flightsRepository: FlightsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: MarkAsReadyCommand): Promise<void> {
    const { flightId, initiatorId } = command;

    const query = new GetFlightByIdQuery(flightId);
    const flight = await this.queryBus.execute(query);

    if (flight.status !== FlightStatus.Created) {
      throw new UnprocessableEntityException(InvalidStatusToMarkAsReadyError);
    }

    if (!flight.loadsheets.preliminary) {
      throw new UnprocessableEntityException(PreliminaryLoadsheetMissingError);
    }

    await this.flightsRepository.updateStatus(flightId, FlightStatus.Ready);
    const event: NewFlightEvent = {
      flightId,
      rotationId: flight.rotationId,
      type: FlightEventType.FlightWasReleased,
      scope: FlightEventScope.User,
      actorId: initiatorId,
    };
    this.eventEmitter.emit(FlightEventType.FlightWasReleased, event);
  }
}
