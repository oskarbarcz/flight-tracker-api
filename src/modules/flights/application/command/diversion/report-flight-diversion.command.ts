import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainEventEmitter } from '../../../../../core/domain/events/domain-event-emitter';

import { DiversionRepository } from '../../../infra/database/repository/diversion.repository';
import { ReportDiversionRequest } from '../../../infra/http/request/diversion.dto';
import { JwtUser } from '../../../../auth/infra/http/request/jwt-user.dto';
import { DiversionWasReportedEvent } from '../../../../../core/domain/events/dto/flight.events';
import { scopeForActor } from '../../../model/event.model';

export class ReportFlightDiversionCommand {
  constructor(
    public readonly flightId: string,
    public readonly actor: JwtUser,
    public readonly payload: ReportDiversionRequest,
  ) {}
}

@CommandHandler(ReportFlightDiversionCommand)
export class ReportFlightDiversionHandler implements ICommandHandler<ReportFlightDiversionCommand> {
  constructor(
    private readonly diversionRepository: DiversionRepository,
    private readonly domainEvents: DomainEventEmitter,
  ) {}

  async execute(command: ReportFlightDiversionCommand): Promise<void> {
    const { flightId, actor, payload } = command;

    await this.diversionRepository.create(flightId, actor, payload);

    this.domainEvents.emit(
      new DiversionWasReportedEvent({
        flightId,
        scope: scopeForActor(actor),
        actorId: actor.sub,
      }),
    );
  }
}
