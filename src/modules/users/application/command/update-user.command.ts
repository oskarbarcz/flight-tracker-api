import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { UpdateUserDto } from '../../infra/http/request/update-user.dto';
import { UsersRepository } from '../../infra/database/repository/users.repository';
import { AssertAirportExistsQuery } from '../../../airports/application/assert/assert-airport-exists.query';

export class UpdateUserCommand {
  constructor(
    public readonly userId: string,
    public readonly data: UpdateUserDto,
  ) {}
}

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(
    private readonly repository: UsersRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: UpdateUserCommand): Promise<void> {
    const { userId, data } = command;

    if (data.homeAirportId) {
      const airportQuery = new AssertAirportExistsQuery(data.homeAirportId);
      await this.queryBus.execute(airportQuery);
    }

    await this.repository.update(userId, data);
  }
}
