import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { GetFlightByIdQuery } from '../../query/get-flight-by-id.query';
import { FlightStatus } from '../../../model/flight.model';
import { FlightDoesNotExistError } from '../../../model/error/flight.error';
import {
  ActiveEmergencyAlreadyExistsError,
  InvalidStatusToDeclareEmergencyError,
} from '../../../model/error/emergency.error';
import {
  DeclareEmergencyRequest,
  GetEmergencyResponse,
} from '../../../infra/http/request/emergency.dto';
import { EmergencyRepository } from '../../../infra/database/repository/emergency.repository';
import { JwtUser } from '../../../../auth/infra/http/request/jwt-user.dto';
import { NewFlightEvent } from '../../../infra/http/request/event.dto';
import { FlightEventType } from '../../../../../core/events/flight';
import { FlightEventScope } from '../../../model/event.model';

const allowedStatuses: ReadonlySet<FlightStatus> = new Set([
  FlightStatus.TaxiingOut,
  FlightStatus.InCruise,
  FlightStatus.TaxiingIn,
]);

export class DeclareEmergencyCommand {
  constructor(
    public readonly flightId: string,
    public readonly actor: JwtUser,
    public readonly payload: DeclareEmergencyRequest,
  ) {}
}

@CommandHandler(DeclareEmergencyCommand)
export class DeclareEmergencyHandler implements ICommandHandler<
  DeclareEmergencyCommand,
  GetEmergencyResponse
> {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly emergencyRepository: EmergencyRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    command: DeclareEmergencyCommand,
  ): Promise<GetEmergencyResponse> {
    const { flightId, actor, payload } = command;

    const flight = await this.queryBus.execute(
      new GetFlightByIdQuery(flightId),
    );

    if (!flight) {
      throw new FlightDoesNotExistError();
    }

    if (!allowedStatuses.has(flight.status)) {
      throw new InvalidStatusToDeclareEmergencyError();
    }

    if (await this.emergencyRepository.hasUnresolved(flightId)) {
      throw new ActiveEmergencyAlreadyExistsError();
    }

    const sheet = flight.loadsheets.final ?? flight.loadsheets.preliminary!;
    const soulsOnBoard =
      sheet.passengers +
      sheet.flightCrew.pilots +
      sheet.flightCrew.reliefPilots +
      sheet.flightCrew.cabinCrew;

    const created = await this.emergencyRepository.create(flightId, {
      ...payload,
      soulsOnBoard,
      reportedBy: actor.sub,
    });

    const event: NewFlightEvent = {
      flightId,
      rotationId: flight.rotationId,
      type: FlightEventType.EmergencyWasDeclared,
      scope: FlightEventScope.User,
      actorId: actor.sub,
    };
    this.eventEmitter.emit(FlightEventType.EmergencyWasDeclared, event);

    return created;
  }
}
