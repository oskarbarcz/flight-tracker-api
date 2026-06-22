import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { DomainEventEmitter } from '../../../../../core/domain/events/domain-event-emitter';

import { DiversionRepository } from '../../../infra/database/repository/diversion.repository';
import { ReportDiversionRequest } from '../../../infra/http/request/diversion.dto';
import { JwtUser } from '../../../../auth/infra/http/request/jwt-user.dto';
import { GetFlightQuery } from '../../query/get-flight.query';
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
    private readonly queryBus: QueryBus,
    private readonly diversionRepository: DiversionRepository,
    private readonly domainEvents: DomainEventEmitter,
  ) {}

  async execute(command: ReportFlightDiversionCommand): Promise<void> {
    const { flightId, actor, payload } = command;

    await this.diversionRepository.create(flightId, actor, payload);

    const query = new GetFlightQuery(flightId);
    const flight = await this.queryBus.execute(query);

    this.domainEvents.emit(
      new DiversionWasReportedEvent({
        flightId,
        rotationId: flight.rotationId,
        scope: scopeForActor(actor),
        actorId: actor.sub,
      }),
    );
  }
}
