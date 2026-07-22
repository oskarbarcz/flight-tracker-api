import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { GetFlightQuery } from '../query/get-flight.query';
import { FlightStatus } from '../../model/flight.model';
import {
  InvalidStatusToMarkAsReadyError,
  PreliminaryLoadsheetMissingError,
} from '../../model/error/flight.error';
import { FlightWasReleasedEvent } from '../../../../core/domain/events/dto/flight.events';
import { FlightEventScope } from '../../model/event.model';
import { FlightsRepository } from '../../infra/database/repository/flights.repository';
import { DomainEventEmitter } from '../../../../core/domain/events/domain-event-emitter';

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
    private readonly domainEvents: DomainEventEmitter,
  ) {}

  async execute(command: MarkAsReadyCommand): Promise<void> {
    const { flightId, initiatorId } = command;

    const query = new GetFlightQuery(flightId);
    const flight = await this.queryBus.execute(query);

    if (flight.status !== FlightStatus.Created) {
      throw new InvalidStatusToMarkAsReadyError();
    }

    if (!flight.loadsheets.preliminary) {
      throw new PreliminaryLoadsheetMissingError();
    }

    await this.flightsRepository.updateStatus(flightId, FlightStatus.Ready);
    this.domainEvents.emit(
      new FlightWasReleasedEvent({
        flightId,
        scope: FlightEventScope.User,
        actorId: initiatorId,
      }),
    );
  }
}
