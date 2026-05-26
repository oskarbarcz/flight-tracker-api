import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { DiversionRepository } from '../../../infra/database/repository/diversion.repository';
import { ReportDiversionRequest } from '../../../infra/http/request/diversion.dto';
import { JwtUser } from '../../../../auth/infra/http/request/jwt-user.dto';
import { GetFlightQuery } from '../../query/get-flight.query';
import { NewFlightEvent } from '../../../infra/http/request/event.dto';
import { FlightEventType } from '../../../../../core/events/flight';
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
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: ReportFlightDiversionCommand): Promise<void> {
    const { flightId, actor, payload } = command;

    await this.diversionRepository.create(flightId, actor, payload);

    const query = new GetFlightQuery(flightId);
    const flight = await this.queryBus.execute(query);

    const event: NewFlightEvent = {
      flightId,
      rotationId: flight.rotationId,
      type: FlightEventType.DiversionWasReported,
      scope: scopeForActor(actor),
      actorId: actor.sub,
    };
    this.eventEmitter.emit(FlightEventType.DiversionWasReported, event);
  }
}
