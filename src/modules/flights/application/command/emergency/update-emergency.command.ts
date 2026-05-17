import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';

import {
  EmergencyAlreadyResolvedError,
  EmergencyNotFoundError,
} from '../../../model/error/emergency.error';
import { UpdateEmergencyRequest } from '../../../infra/http/request/emergency.dto';
import { EmergencyRepository } from '../../../infra/database/repository/emergency.repository';
import { JwtUser } from '../../../../auth/infra/http/request/jwt-user.dto';
import { GetFlightQuery } from '../../query/get-flight.query';
import { FlightDoesNotExistError } from '../../../model/error/flight.error';
import { NewFlightEvent } from '../../../infra/http/request/event.dto';
import { FlightEventType } from '../../../../../core/events/flight';
import { FlightEventScope } from '../../../model/event.model';

export class UpdateEmergencyCommand {
  constructor(
    public readonly flightId: string,
    public readonly emergencyId: string,
    public readonly actor: JwtUser,
    public readonly payload: UpdateEmergencyRequest,
  ) {}
}

@CommandHandler(UpdateEmergencyCommand)
export class UpdateEmergencyHandler implements ICommandHandler<UpdateEmergencyCommand> {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly emergencyRepository: EmergencyRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: UpdateEmergencyCommand): Promise<void> {
    const { flightId, emergencyId, actor, payload } = command;

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

    await this.emergencyRepository.update(emergencyId, payload);

    const event: NewFlightEvent = {
      flightId,
      rotationId: flight.rotationId,
      type: FlightEventType.EmergencyWasUpdated,
      scope: FlightEventScope.User,
      actorId: actor.sub,
    };
    this.eventEmitter.emit(FlightEventType.EmergencyWasUpdated, event);
  }
}
