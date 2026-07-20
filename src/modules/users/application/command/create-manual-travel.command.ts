import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { UserTravelType } from '../../../../../prisma/client/enums';
import { UserRole } from '../../model/user-role';
import { haversineDistanceNm } from '../../../../core/utils/distance';
import { UserTravelRepository } from '../../infra/database/repository/user-travel.repository';
import { UsersRepository } from '../../infra/database/repository/users.repository';
import { UserNotFoundError } from '../../model/error/user.error';
import { GetAirportByIdQuery } from '../../../airports/application/query/get-airport-by-id.query';
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
    private readonly usersRepository: UsersRepository,
    private readonly travelRepository: UserTravelRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: CreateManualTravelCommand): Promise<void> {
    const { userId, destinationAirportId } = command;

    const user = await this.usersRepository.getTravelProfile(userId);

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

    const destinationQuery = new GetAirportByIdQuery(destinationAirportId);
    const destination = await this.queryBus.execute(destinationQuery);

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
