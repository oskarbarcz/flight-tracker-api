import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../core/provider/prisma/prisma.service';
import { AircraftRepositionType } from 'prisma/client/enums';
import { haversineDistanceNm } from '../../../../../core/utils/distance';
import { RepositionRepository } from '../../../infra/database/repository/reposition.repository';
import { AircraftNotFoundError } from '../../../model/error/aircraft.error';
import { AirportNotFoundError } from '../../../../airports/model/error/airport.error';
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
    private readonly prisma: PrismaService,
    private readonly repositionRepository: RepositionRepository,
  ) {}

  async execute(command: CreateManualRepositionCommand): Promise<void> {
    const { aircraftId, destinationAirportId } = command;

    const aircraft = await this.prisma.aircraft.findUnique({
      where: { id: aircraftId },
      select: {
        lastAirportId: true,
        lastAirport: { select: { location: true } },
      },
    });

    if (!aircraft) {
      throw new AircraftNotFoundError();
    }

    if (!aircraft.lastAirportId) {
      throw new AircraftHasNoCurrentAirportError();
    }

    if (aircraft.lastAirportId === destinationAirportId) {
      throw new RepositionDestinationEqualsOriginError();
    }

    const destination = await this.prisma.airport.findUnique({
      where: { id: destinationAirportId },
      select: { location: true },
    });

    if (!destination) {
      throw new AirportNotFoundError();
    }

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
