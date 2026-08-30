import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { DomainEventEmitter } from '../../../../../core/domain/events/domain-event-emitter';

import { GetFlightQuery } from '../../query/get-flight.query';
import { FlightStatus } from '../../../model/flight.model';
import {
  FlightDoesNotExistError,
  LoadsheetMissingError,
} from '../../../model/error/flight.error';
import { GetCurrentLoadsheetQuery } from '../../query/get-current-loadsheet.query';
import { LoadsheetKind } from '../../../model/loadsheet.model';
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
import { EmergencyWasDeclaredEvent } from '../../../../../core/domain/events/dto/flight.events';
import { FlightEventScope } from '../../../model/event.model';
import { resolveDangerousGoodsOnBoard } from '../../../model/emergency-dangerous-goods';
import { GetFlightCargoLoadQuery } from '../../../../manifest/application/query/get-flight-cargo-load.query';
import { CargoManifestNotGeneratedError } from '../../../../manifest/model/error/cargo.error';
import {
  CargoShipmentStatusName,
  FlightCargoManifest,
} from '../../../../manifest/model/cargo-manifest.model';
import { HazardClass } from '../../../../manifest/model/commodity.model';

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
    private readonly domainEvents: DomainEventEmitter,
  ) {}

  async execute(
    command: DeclareEmergencyCommand,
  ): Promise<GetEmergencyResponse> {
    const { flightId, actor, payload } = command;

    const flight = await this.queryBus.execute(new GetFlightQuery(flightId));

    if (!flight) {
      throw new FlightDoesNotExistError();
    }

    if (!allowedStatuses.has(flight.status)) {
      throw new InvalidStatusToDeclareEmergencyError();
    }

    if (await this.emergencyRepository.hasUnresolved(flightId)) {
      throw new ActiveEmergencyAlreadyExistsError();
    }

    const [finalLoadsheet, preliminaryLoadsheet] = await Promise.all([
      this.queryBus.execute(
        new GetCurrentLoadsheetQuery(flightId, LoadsheetKind.Final),
      ),
      this.queryBus.execute(
        new GetCurrentLoadsheetQuery(flightId, LoadsheetKind.Preliminary),
      ),
    ]);

    const sheet = finalLoadsheet ?? preliminaryLoadsheet;

    if (!sheet) {
      throw new LoadsheetMissingError();
    }

    const soulsOnBoard =
      sheet.passengers +
      sheet.flightCrew.pilots +
      sheet.flightCrew.reliefPilots +
      sheet.flightCrew.cabinCrew;

    const created = await this.emergencyRepository.create(flightId, {
      ...payload,
      dangerousGoodsOnBoard: resolveDangerousGoodsOnBoard(
        payload.dangerousGoodsOnBoard,
        await this.hazardClassesAboard(flightId),
      ),
      soulsOnBoard,
      reportedBy: actor.sub,
    });

    await this.domainEvents.emitAsync(
      new EmergencyWasDeclaredEvent({
        flightId,
        scope: FlightEventScope.User,
        actorId: actor.sub,
      }),
    );

    return created;
  }

  private async hazardClassesAboard(flightId: string): Promise<HazardClass[]> {
    const query = new GetFlightCargoLoadQuery(
      flightId,
      CargoShipmentStatusName.Loaded,
    );

    try {
      const manifest: FlightCargoManifest = await this.queryBus.execute(query);

      return manifest.units
        .flatMap((unit) => unit.shipments)
        .map((shipment) => shipment.dangerousGoods?.hazardClass)
        .filter((hazardClass): hazardClass is HazardClass =>
          Boolean(hazardClass),
        );
    } catch (error) {
      if (error instanceof CargoManifestNotGeneratedError) {
        return [];
      }

      throw error;
    }
  }
}
