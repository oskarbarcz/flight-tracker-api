import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { GetFlightQuery } from '../query/get-flight.query';
import { FlightStatus } from '../../model/flight.model';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InvalidStatusToCloseFlight } from '../../infra/http/request/errors.dto';
import { FlightsRepository } from '../../infra/database/repository/flights.repository';
import { FlightWasClosedEvent } from '../../../../core/domain/events/dto/flight.events';
import { FlightEventScope } from '../../model/event.model';
import { DomainEventEmitter } from '../../../../core/domain/events/domain-event-emitter';
import { IsFlightDelayClearedQuery } from '../query/delay/is-flight-delay-cleared.query';
import { FlightHasUnacceptedDelayError } from '../../model/error/delay.error';

export class CloseFlightCommand {
  constructor(
    public readonly flightId: string,
    public readonly initiatorId: string,
    public readonly actualFuelBurned: number | null = null,
  ) {}
}

@CommandHandler(CloseFlightCommand)
export class CloseFlightHandler implements ICommandHandler<CloseFlightCommand> {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly flightsRepository: FlightsRepository,
    private readonly domainEvents: DomainEventEmitter,
  ) {}

  async execute(command: CloseFlightCommand): Promise<void> {
    const { flightId, initiatorId, actualFuelBurned } = command;
    const query = new GetFlightQuery(flightId);
    const flight = await this.queryBus.execute(query);

    if (!flight) {
      throw new NotFoundException(InvalidStatusToCloseFlight);
    }

    if (flight.status !== FlightStatus.OffboardingFinished) {
      throw new UnprocessableEntityException(InvalidStatusToCloseFlight);
    }

    await this.flightsRepository.assertNoUnresolvedEmergency(flightId);

    const delayCleared = await this.queryBus.execute(
      new IsFlightDelayClearedQuery(flightId),
    );
    if (!delayCleared) {
      throw new FlightHasUnacceptedDelayError();
    }

    await this.flightsRepository.close(flightId, actualFuelBurned);

    this.domainEvents.emit(
      new FlightWasClosedEvent({
        flightId,
        rotationId: flight.rotationId,
        scope: FlightEventScope.User,
        actorId: initiatorId,
        aircraftId: flight.aircraft.id,
      }),
    );
  }
}
