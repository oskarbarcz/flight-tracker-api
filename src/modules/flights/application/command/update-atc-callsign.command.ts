import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainEventEmitter } from '../../../../core/domain/events/domain-event-emitter';
import { FlightsRepository } from '../../infra/database/repository/flights.repository';
import {
  FlightDoesNotExistError,
  InvalidStatusToUpdateAtcCallsignError,
} from '../../model/error/flight.error';
import { FlightStatus } from '../../model/flight.model';
import { AtcCallsignWasChangedEvent } from '../../../../core/domain/events/dto/flight.events';
import { scopeForActor } from '../../model/event.model';
import { JwtUser } from '../../../auth/infra/http/request/jwt-user.dto';

export class UpdateAtcCallsignCommand {
  constructor(
    public readonly flightId: string,
    public readonly actor: JwtUser,
    public readonly atcCallsign: string | null,
  ) {}
}

@CommandHandler(UpdateAtcCallsignCommand)
export class UpdateAtcCallsignHandler implements ICommandHandler<UpdateAtcCallsignCommand> {
  constructor(
    private readonly flightsRepository: FlightsRepository,
    private readonly domainEvents: DomainEventEmitter,
  ) {}

  async execute(command: UpdateAtcCallsignCommand): Promise<void> {
    const { flightId, actor, atcCallsign } = command;

    const flight = await this.flightsRepository.findOneBy({ id: flightId });
    if (!flight) {
      throw new FlightDoesNotExistError();
    }

    const preTakeoffStatuses: string[] = [
      FlightStatus.Created,
      FlightStatus.Ready,
      FlightStatus.CheckedIn,
      FlightStatus.BoardingStarted,
      FlightStatus.BoardingFinished,
      FlightStatus.TaxiingOut,
    ];
    if (!preTakeoffStatuses.includes(flight.status)) {
      throw new InvalidStatusToUpdateAtcCallsignError();
    }

    await this.flightsRepository.updateAtcCallsign(flightId, atcCallsign);

    await this.domainEvents.emitAsync(
      new AtcCallsignWasChangedEvent({
        flightId,
        scope: scopeForActor(actor),
        actorId: actor.sub,
      }),
    );
  }
}
