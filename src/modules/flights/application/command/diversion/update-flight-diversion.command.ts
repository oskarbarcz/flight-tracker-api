import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { DomainEventEmitter } from '../../../../../core/domain/events/domain-event-emitter';

import { DiversionRepository } from '../../../infra/database/repository/diversion.repository';
import { UpdateDiversionRequest } from '../../../infra/http/request/diversion.dto';
import { JwtUser } from '../../../../auth/infra/http/request/jwt-user.dto';
import { GetFlightQuery } from '../../query/get-flight.query';
import { FlightDoesNotExistError } from '../../../model/error/flight.error';
import {
  DiversionNotFoundError,
  InvalidStatusToReportDiversionError,
} from '../../../model/error/diversion.error';
import { FlightStatus } from '../../../model/flight.model';
import { DiversionWasUpdatedEvent } from '../../../../../core/domain/events/dto/flight.events';
import { scopeForActor } from '../../../model/event.model';

export class UpdateFlightDiversionCommand {
  constructor(
    public readonly flightId: string,
    public readonly actor: JwtUser,
    public readonly payload: UpdateDiversionRequest,
  ) {}
}

@CommandHandler(UpdateFlightDiversionCommand)
export class UpdateFlightDiversionHandler implements ICommandHandler<UpdateFlightDiversionCommand> {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly diversionRepository: DiversionRepository,
    private readonly domainEvents: DomainEventEmitter,
  ) {}

  async execute(command: UpdateFlightDiversionCommand): Promise<void> {
    const { flightId, actor, payload } = command;

    const query = new GetFlightQuery(flightId);
    const flight = await this.queryBus.execute(query);
    if (!flight) {
      throw new FlightDoesNotExistError();
    }

    const hasDiversion =
      await this.diversionRepository.existsActiveDiversion(flightId);
    if (!hasDiversion) {
      throw new DiversionNotFoundError();
    }

    if (
      flight.status !== FlightStatus.InCruise &&
      flight.status !== FlightStatus.TaxiingOut
    ) {
      throw new InvalidStatusToReportDiversionError();
    }

    await this.diversionRepository.update(flightId, payload);

    this.domainEvents.emit(
      new DiversionWasUpdatedEvent({
        flightId,
        scope: scopeForActor(actor),
        actorId: actor.sub,
      }),
    );
  }
}
