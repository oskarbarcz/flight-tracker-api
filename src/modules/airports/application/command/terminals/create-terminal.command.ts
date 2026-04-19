import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateTerminalRequest } from '../../../infra/http/request/terminal.dto';
import { TerminalsRepository } from '../../../infra/database/terminals.repository';
import { AirportsRepository } from '../../../infra/database/airports.repository';
import { AirportNotFoundError } from '../../../model/error/airport.error';

export class CreateTerminalCommand {
  constructor(
    public readonly airportId: string,
    public readonly terminalId: string,
    public readonly data: CreateTerminalRequest,
  ) {}
}

@CommandHandler(CreateTerminalCommand)
export class CreateTerminalHandler implements ICommandHandler<CreateTerminalCommand> {
  constructor(
    private readonly terminalsRepository: TerminalsRepository,
    private readonly airportsRepository: AirportsRepository,
  ) {}

  async execute(command: CreateTerminalCommand): Promise<void> {
    const { airportId, terminalId, data } = command;

    if (!(await this.airportsRepository.exists(airportId))) {
      throw new AirportNotFoundError();
    }

    await this.terminalsRepository.create(airportId, terminalId, data);
  }
}
