import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { AircraftRepositionType } from 'prisma/client/enums';
import { haversineDistanceNm } from '../../../../../core/utils/distance';
import { RepositionRepository } from '../../../infra/database/repository/reposition.repository';
import { AircraftRepository } from '../../../infra/database/repository/aircraft.repository';
import { AircraftNotFoundError } from '../../../model/error/aircraft.error';
import { GetAirportByIdQuery } from '../../../../airports/application/query/get-airport-by-id.query';
import {
  AircraftHasNoCurrentAirportError,
  RepositionDestinationEqualsOriginError,
} from '../../../model/error/reposition.error';

type Coordinates = { latitude: number; longitude: number };

export class CreateManualRepositionCommand {
  constructor(
    public readonly aircraftId: string,
    public readonly destinationAirportId: string,
  ) {}
}

@CommandHandler(CreateManualRepositionCommand)
export class CreateManualRepositionHandler implements ICommandHandler<CreateManualRepositionCommand> {
  constructor(
    private readonly aircraftRepository: AircraftRepository,
    private readonly repositionRepository: RepositionRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: CreateManualRepositionCommand): Promise<void> {
    const { aircraftId, destinationAirportId } = command;

    const aircraft =
      await this.aircraftRepository.getRepositionOrigin(aircraftId);

    if (!aircraft) {
      throw new AircraftNotFoundError();
    }

    if (!aircraft.lastAirportId) {
      throw new AircraftHasNoCurrentAirportError();
    }

    if (aircraft.lastAirportId === destinationAirportId) {
      throw new RepositionDestinationEqualsOriginError();
    }

    const destinationQuery = new GetAirportByIdQuery(destinationAirportId);
    const destination = await this.queryBus.execute(destinationQuery);

    const distance = haversineDistanceNm(
      aircraft.lastAirport!.location as unknown as Coordinates,
      destination.location as unknown as Coordinates,
    );

    await this.repositionRepository.createDeadhead(
      AircraftRepositionType.dead_head_manual,
      aircraftId,
      aircraft.lastAirportId,
      destinationAirportId,
      distance,
      null,
    );
  }
}
