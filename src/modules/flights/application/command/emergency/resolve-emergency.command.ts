import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { DomainEventEmitter } from '../../../../../core/domain/events/domain-event-emitter';

import {
  EmergencyAlreadyResolvedError,
  EmergencyNotFoundError,
} from '../../../model/error/emergency.error';
import { EmergencyRepository } from '../../../infra/database/repository/emergency.repository';
import { JwtUser } from '../../../../auth/infra/http/request/jwt-user.dto';
import { GetFlightQuery } from '../../query/get-flight.query';
import { FlightDoesNotExistError } from '../../../model/error/flight.error';
import { EmergencyWasResolvedEvent } from '../../../../../core/domain/events/dto/flight.events';
import { FlightEventScope } from '../../../model/event.model';

export class ResolveEmergencyCommand {
  constructor(
    public readonly flightId: string,
    public readonly emergencyId: string,
    public readonly actor: JwtUser,
  ) {}
}

@CommandHandler(ResolveEmergencyCommand)
export class ResolveEmergencyHandler implements ICommandHandler<ResolveEmergencyCommand> {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly emergencyRepository: EmergencyRepository,
    private readonly domainEvents: DomainEventEmitter,
  ) {}

  async execute(command: ResolveEmergencyCommand): Promise<void> {
    const { flightId, emergencyId, actor } = command;

    const flight = await this.queryBus.execute(new GetFlightQuery(flightId));
    if (!flight) {
      throw new FlightDoesNotExistError();
    }

    const existing = await this.emergencyRepository.findById(
      flightId,
      emergencyId,
    );
    if (!existing) {
      throw new EmergencyNotFoundError();
    }
    if (existing.resolvedAt !== null) {
      throw new EmergencyAlreadyResolvedError();
    }

    await this.emergencyRepository.resolve(flightId, emergencyId, actor.sub);

    this.domainEvents.emit(
      new EmergencyWasResolvedEvent({
        flightId,
        rotationId: flight.rotationId,
        scope: FlightEventScope.User,
        actorId: actor.sub,
      }),
    );
  }
}
