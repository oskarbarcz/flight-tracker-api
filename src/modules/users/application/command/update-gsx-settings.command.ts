import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateGsxSettingsDto } from '../../infra/http/request/update-gsx-settings.dto';
import { UsersRepository } from '../../infra/database/repository/users.repository';

export class UpdateGsxSettingsCommand {
  constructor(
    public readonly userId: string,
    public readonly data: UpdateGsxSettingsDto,
  ) {}
}

@CommandHandler(UpdateGsxSettingsCommand)
export class UpdateGsxSettingsHandler implements ICommandHandler<UpdateGsxSettingsCommand> {
  constructor(private readonly repository: UsersRepository) {}

  async execute(command: UpdateGsxSettingsCommand): Promise<void> {
    await this.repository.updateGsxSettings(command.userId, command.data);
  }
}
