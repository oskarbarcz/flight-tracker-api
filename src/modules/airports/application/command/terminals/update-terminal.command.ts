import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateTerminalRequest } from '../../../infra/http/request/terminal.dto';
import { TerminalsRepository } from '../../../infra/database/terminals.repository';

export class UpdateTerminalCommand {
  constructor(
    public readonly airportId: string,
    public readonly terminalId: string,
    public readonly data: UpdateTerminalRequest,
  ) {}
}

@CommandHandler(UpdateTerminalCommand)
export class UpdateTerminalHandler implements ICommandHandler<UpdateTerminalCommand> {
  constructor(private readonly repository: TerminalsRepository) {}

  async execute(command: UpdateTerminalCommand): Promise<void> {
    await this.repository.update(
      command.airportId,
      command.terminalId,
      command.data,
    );
  }
}
