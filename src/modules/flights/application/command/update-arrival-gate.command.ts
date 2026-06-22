import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainEventEmitter } from '../../../../core/domain/events/domain-event-emitter';
import { FlightsRepository } from '../../infra/database/repository/flights.repository';
import {
  FlightDoesNotExistError,
  InvalidStatusToUpdateArrivalGateError,
} from '../../model/error/flight.error';
import { FlightStatus } from '../../model/flight.model';
import { ArrivalGateWasChangedEvent } from '../../../../core/domain/events/dto/flight.events';
import { scopeForActor } from '../../model/event.model';
import { JwtUser } from '../../../auth/infra/http/request/jwt-user.dto';

export class UpdateArrivalGateCommand {
  constructor(
    public readonly flightId: string,
    public readonly actor: JwtUser,
    public readonly arrivalGateId: string,
  ) {}
}

@CommandHandler(UpdateArrivalGateCommand)
export class UpdateArrivalGateHandler implements ICommandHandler<UpdateArrivalGateCommand> {
  constructor(
    private readonly flightsRepository: FlightsRepository,
    private readonly domainEvents: DomainEventEmitter,
  ) {}

  async execute(command: UpdateArrivalGateCommand): Promise<void> {
    const { flightId, actor, arrivalGateId } = command;

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
      throw new InvalidStatusToUpdateArrivalGateError();
    }

    await this.flightsRepository.updateArrivalGate(flightId, arrivalGateId);

    this.domainEvents.emit(
      new ArrivalGateWasChangedEvent({
        flightId,
        rotationId: flight.rotationId,
        scope: scopeForActor(actor),
        actorId: actor.sub,
      }),
    );
  }
}
