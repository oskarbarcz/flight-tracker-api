import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TerminalsRepository } from '../../../infra/database/terminals.repository';
import { AirportsRepository } from '../../../infra/database/airports.repository';
import { AirportNotFoundError } from '../../../model/error/airport.error';
import { TerminalNotFoundError } from '../../../model/error/terminal.error';

export class RemoveTerminalCommand {
  constructor(
    public readonly airportId: string,
    public readonly terminalId: string,
  ) {}
}

@CommandHandler(RemoveTerminalCommand)
export class RemoveTerminalHandler implements ICommandHandler<RemoveTerminalCommand> {
  constructor(
    private readonly terminalsRepository: TerminalsRepository,
    private readonly airportsRepository: AirportsRepository,
  ) {}

  async execute(command: RemoveTerminalCommand): Promise<void> {
    const { airportId, terminalId } = command;

    if (!(await this.airportsRepository.exists(airportId))) {
      throw new AirportNotFoundError();
    }

    if (!(await this.terminalsRepository.exists(airportId, terminalId))) {
      throw new TerminalNotFoundError();
    }

    await this.terminalsRepository.remove(terminalId);
  }
}
