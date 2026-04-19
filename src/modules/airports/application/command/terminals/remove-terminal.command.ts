import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TerminalsRepository } from '../../../infra/database/terminals.repository';

export class RemoveTerminalCommand {
  constructor(
    public readonly airportId: string,
    public readonly terminalId: string,
  ) {}
}

@CommandHandler(RemoveTerminalCommand)
export class RemoveTerminalHandler implements ICommandHandler<RemoveTerminalCommand> {
  constructor(private readonly repository: TerminalsRepository) {}

  async execute(command: RemoveTerminalCommand): Promise<void> {
    await this.repository.remove(command.airportId, command.terminalId);
  }
}
