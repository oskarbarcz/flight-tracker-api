import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateUserDto } from '../../infra/http/request/update-user.dto';
import { UsersRepository } from '../../infra/database/repository/users.repository';

export class UpdateUserCommand {
  constructor(
    public readonly userId: string,
    public readonly data: UpdateUserDto,
  ) {}
}

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(private readonly repository: UsersRepository) {}

  async execute(command: UpdateUserCommand): Promise<void> {
    const { userId, data } = command;
    await this.repository.update(userId, data);
  }
}
