import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainEventEmitter } from '../../../../core/domain/events/domain-event-emitter';
import { FlightsRepository } from '../../infra/database/repository/flights.repository';
import {
  FlightDoesNotExistError,
  InvalidStatusToUpdateDepartureParkingPositionError,
} from '../../model/error/flight.error';
import { FlightStatus } from '../../model/flight.model';
import { DepartureParkingPositionWasChangedEvent } from '../../../../core/domain/events/dto/flight.events';
import { scopeForActor } from '../../model/event.model';
import { JwtUser } from '../../../auth/infra/http/request/jwt-user.dto';

export class UpdateDepartureParkingPositionCommand {
  constructor(
    public readonly flightId: string,
    public readonly actor: JwtUser,
    public readonly departureParkingPositionId: string,
  ) {}
}

@CommandHandler(UpdateDepartureParkingPositionCommand)
export class UpdateDepartureParkingPositionHandler implements ICommandHandler<UpdateDepartureParkingPositionCommand> {
  constructor(
    private readonly flightsRepository: FlightsRepository,
    private readonly domainEvents: DomainEventEmitter,
  ) {}

  async execute(command: UpdateDepartureParkingPositionCommand): Promise<void> {
    const { flightId, actor, departureParkingPositionId } = command;

    const flight = await this.flightsRepository.findOneBy({ id: flightId });
    if (!flight) {
      throw new FlightDoesNotExistError();
    }

    const preCheckInStatuses: string[] = [
      FlightStatus.Created,
      FlightStatus.Ready,
    ];
    if (!preCheckInStatuses.includes(flight.status)) {
      throw new InvalidStatusToUpdateDepartureParkingPositionError();
    }

    await this.flightsRepository.updateDepartureParkingPosition(
      flightId,
      departureParkingPositionId,
    );

    this.domainEvents.emit(
      new DepartureParkingPositionWasChangedEvent({
        flightId,
        rotationId: flight.rotationId,
        scope: scopeForActor(actor),
        actorId: actor.sub,
      }),
    );
  }
}
