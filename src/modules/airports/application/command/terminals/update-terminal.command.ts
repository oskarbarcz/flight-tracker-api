import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateTerminalRequest } from '../../../infra/http/request/terminal.dto';
import { TerminalsRepository } from '../../../infra/database/terminals.repository';
import { AirportsRepository } from '../../../infra/database/airports.repository';
import { AirportNotFoundError } from '../../../model/error/airport.error';
import { TerminalNotFoundError } from '../../../model/error/terminal.error';

export class UpdateTerminalCommand {
  constructor(
    public readonly airportId: string,
    public readonly terminalId: string,
    public readonly data: UpdateTerminalRequest,
  ) {}
}

@CommandHandler(UpdateTerminalCommand)
export class UpdateTerminalHandler implements ICommandHandler<UpdateTerminalCommand> {
  constructor(
    private readonly terminalsRepository: TerminalsRepository,
    private readonly airportsRepository: AirportsRepository,
  ) {}

  async execute(command: UpdateTerminalCommand): Promise<void> {
    const { airportId, terminalId, data } = command;

    if (!(await this.airportsRepository.exists(airportId))) {
      throw new AirportNotFoundError();
    }

    if (!(await this.terminalsRepository.exists(airportId, terminalId))) {
      throw new TerminalNotFoundError();
    }

    await this.terminalsRepository.update(terminalId, data);
  }
}
