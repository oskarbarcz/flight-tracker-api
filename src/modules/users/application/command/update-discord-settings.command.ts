import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateDiscordSettingsDto } from '../../infra/http/request/update-discord-settings.dto';
import { UsersRepository } from '../../infra/database/repository/users.repository';

export class UpdateDiscordSettingsCommand {
  constructor(
    public readonly userId: string,
    public readonly data: UpdateDiscordSettingsDto,
  ) {}
}

@CommandHandler(UpdateDiscordSettingsCommand)
export class UpdateDiscordSettingsHandler implements ICommandHandler<UpdateDiscordSettingsCommand> {
  constructor(private readonly repository: UsersRepository) {}

  async execute(command: UpdateDiscordSettingsCommand): Promise<void> {
    await this.repository.updateDiscordSettings(command.userId, command.data);
  }
}
