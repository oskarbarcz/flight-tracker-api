import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../core/provider/prisma/prisma.service';
import { UserRole, UserTravelType } from '../../../../../prisma/client/enums';
import { haversineDistanceNm } from '../../../../core/utils/distance';
import { UserTravelRepository } from '../../infra/database/repository/user-travel.repository';
import { UserNotFoundError } from '../../model/error/user.error';
import { AirportNotFoundError } from '../../../airports/model/error/airport.error';
import {
  OnlyCabinCrewCanTravelError,
  TravelDestinationEqualsOriginError,
  UserHasNoCurrentAirportError,
} from '../../model/error/user-travel.error';

type Coordinates = { latitude: number; longitude: number };

export class CreateManualTravelCommand {
  constructor(
    public readonly userId: string,
    public readonly destinationAirportId: string,
  ) {}
}

@CommandHandler(CreateManualTravelCommand)
export class CreateManualTravelHandler implements ICommandHandler<CreateManualTravelCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly travelRepository: UserTravelRepository,
  ) {}

  async execute(command: CreateManualTravelCommand): Promise<void> {
    const { userId, destinationAirportId } = command;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        lastAirportId: true,
        lastAirport: { select: { location: true } },
      },
    });

    if (!user) {
      throw new UserNotFoundError();
    }

    if (user.role !== UserRole.CabinCrew) {
      throw new OnlyCabinCrewCanTravelError();
    }

    if (!user.lastAirportId) {
      throw new UserHasNoCurrentAirportError();
    }

    if (user.lastAirportId === destinationAirportId) {
      throw new TravelDestinationEqualsOriginError();
    }

    const destination = await this.prisma.airport.findUnique({
      where: { id: destinationAirportId },
      select: { location: true },
    });

    if (!destination) {
      throw new AirportNotFoundError();
    }

    const distance = haversineDistanceNm(
      user.lastAirport!.location as unknown as Coordinates,
      destination.location as unknown as Coordinates,
    );

    await this.travelRepository.createDeadhead(
      UserTravelType.dead_head_manual,
      userId,
      user.lastAirportId,
      destinationAirportId,
      distance,
      null,
    );
  }
}
