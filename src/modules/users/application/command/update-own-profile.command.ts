import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { UpdateOwnProfileDto } from '../../infra/http/request/update-own-profile.dto';
import { UsersRepository } from '../../infra/database/repository/users.repository';
import { AssertAirportExistsQuery } from '../../../airports/application/assert/assert-airport-exists.query';

export class UpdateOwnProfileCommand {
  constructor(
    public readonly userId: string,
    public readonly data: UpdateOwnProfileDto,
  ) {}
}

@CommandHandler(UpdateOwnProfileCommand)
export class UpdateOwnProfileHandler implements ICommandHandler<UpdateOwnProfileCommand> {
  constructor(
    private readonly repository: UsersRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: UpdateOwnProfileCommand): Promise<void> {
    const { userId, data } = command;

    if (data.homeAirportId) {
      const airportQuery = new AssertAirportExistsQuery(data.homeAirportId);
      await this.queryBus.execute(airportQuery);
    }

    await this.repository.update(userId, data);
  }
}
