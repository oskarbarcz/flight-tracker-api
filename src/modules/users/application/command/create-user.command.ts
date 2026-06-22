import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserDto } from '../../infra/http/request/create-user.dto';
import { UsersRepository } from '../../infra/database/repository/users.repository';

export class CreateUserCommand {
  constructor(
    public readonly userId: string,
    public readonly data: CreateUserDto,
  ) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(private readonly repository: UsersRepository) {}

  async execute(command: CreateUserCommand): Promise<void> {
    const { userId, data } = command;
    await this.repository.create(userId, data);
  }
}
