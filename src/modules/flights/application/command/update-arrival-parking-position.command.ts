import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainEventEmitter } from '../../../../core/domain/events/domain-event-emitter';
import { FlightsRepository } from '../../infra/database/repository/flights.repository';
import {
  FlightDoesNotExistError,
  InvalidStatusToUpdateArrivalParkingPositionError,
} from '../../model/error/flight.error';
import { FlightStatus } from '../../model/flight.model';
import { ArrivalParkingPositionWasChangedEvent } from '../../../../core/domain/events/dto/flight.events';
import { scopeForActor } from '../../model/event.model';
import { JwtUser } from '../../../auth/infra/http/request/jwt-user.dto';

export class UpdateArrivalParkingPositionCommand {
  constructor(
    public readonly flightId: string,
    public readonly actor: JwtUser,
    public readonly arrivalParkingPositionId: string,
  ) {}
}

@CommandHandler(UpdateArrivalParkingPositionCommand)
export class UpdateArrivalParkingPositionHandler implements ICommandHandler<UpdateArrivalParkingPositionCommand> {
  constructor(
    private readonly flightsRepository: FlightsRepository,
    private readonly domainEvents: DomainEventEmitter,
  ) {}

  async execute(command: UpdateArrivalParkingPositionCommand): Promise<void> {
    const { flightId, actor, arrivalParkingPositionId } = command;

    const flight = await this.flightsRepository.findOneBy({ id: flightId });
    if (!flight) {
      throw new FlightDoesNotExistError();
    }

    const preOnBlockStatuses: string[] = [
      FlightStatus.Created,
      FlightStatus.Ready,
      FlightStatus.CheckedIn,
      FlightStatus.BoardingStarted,
      FlightStatus.BoardingFinished,
      FlightStatus.TaxiingOut,
      FlightStatus.InCruise,
      FlightStatus.TaxiingIn,
    ];
    if (!preOnBlockStatuses.includes(flight.status)) {
      throw new InvalidStatusToUpdateArrivalParkingPositionError();
    }

    await this.flightsRepository.updateArrivalParkingPosition(
      flightId,
      arrivalParkingPositionId,
    );

    this.domainEvents.emit(
      new ArrivalParkingPositionWasChangedEvent({
        flightId,
        rotationId: flight.rotationId,
        scope: scopeForActor(actor),
        actorId: actor.sub,
      }),
    );
  }
}
