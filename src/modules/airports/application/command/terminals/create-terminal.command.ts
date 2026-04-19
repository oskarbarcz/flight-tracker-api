import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateTerminalRequest } from '../../../infra/http/request/terminal.dto';
import { TerminalsRepository } from '../../../infra/database/terminals.repository';

export class CreateTerminalCommand {
  constructor(
    public readonly airportId: string,
    public readonly terminalId: string,
    public readonly data: CreateTerminalRequest,
  ) {}
}

@CommandHandler(CreateTerminalCommand)
export class CreateTerminalHandler implements ICommandHandler<CreateTerminalCommand> {
  constructor(private readonly repository: TerminalsRepository) {}

  async execute(command: CreateTerminalCommand): Promise<void> {
    await this.repository.create(
      command.airportId,
      command.terminalId,
      command.data,
    );
  }
}
