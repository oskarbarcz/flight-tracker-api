import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainEventEmitter } from '../../../../core/domain/events/domain-event-emitter';
import { FlightsRepository } from '../../infra/database/repository/flights.repository';
import {
  FlightDoesNotExistError,
  InvalidStatusToUpdateDepartureGateError,
} from '../../model/error/flight.error';
import { FlightStatus } from '../../model/flight.model';
import { DepartureGateWasChangedEvent } from '../../../../core/domain/events/dto/flight.events';
import { scopeForActor } from '../../model/event.model';
import { JwtUser } from '../../../auth/infra/http/request/jwt-user.dto';

export class UpdateDepartureGateCommand {
  constructor(
    public readonly flightId: string,
    public readonly actor: JwtUser,
    public readonly departureGateId: string,
  ) {}
}

@CommandHandler(UpdateDepartureGateCommand)
export class UpdateDepartureGateHandler implements ICommandHandler<UpdateDepartureGateCommand> {
  constructor(
    private readonly flightsRepository: FlightsRepository,
    private readonly domainEvents: DomainEventEmitter,
  ) {}

  async execute(command: UpdateDepartureGateCommand): Promise<void> {
    const { flightId, actor, departureGateId } = command;

    const flight = await this.flightsRepository.findOneBy({ id: flightId });
    if (!flight) {
      throw new FlightDoesNotExistError();
    }

    const preCheckInStatuses: string[] = [
      FlightStatus.Created,
      FlightStatus.Ready,
    ];
    if (!preCheckInStatuses.includes(flight.status)) {
      throw new InvalidStatusToUpdateDepartureGateError();
    }

    await this.flightsRepository.updateDepartureGate(flightId, departureGateId);

    this.domainEvents.emit(
      new DepartureGateWasChangedEvent({
        flightId,
        rotationId: flight.rotationId,
        scope: scopeForActor(actor),
        actorId: actor.sub,
      }),
    );
  }
}
