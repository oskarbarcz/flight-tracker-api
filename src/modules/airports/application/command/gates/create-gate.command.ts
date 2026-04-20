import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateGateRequest } from '../../../infra/http/request/gate.dto';
import { GatesRepository } from '../../../infra/database/gates.repository';
import { TerminalsRepository } from '../../../infra/database/terminals.repository';
import { AirportsRepository } from '../../../infra/database/airports.repository';
import { AirportNotFoundError } from '../../../model/error/airport.error';
import { TerminalNotFoundError } from '../../../model/error/terminal.error';

export class CreateGateCommand {
  constructor(
    public readonly airportId: string,
    public readonly gateId: string,
    public readonly data: CreateGateRequest,
  ) {}
}

@CommandHandler(CreateGateCommand)
export class CreateGateHandler implements ICommandHandler<CreateGateCommand> {
  constructor(
    private readonly gatesRepository: GatesRepository,
    private readonly terminalsRepository: TerminalsRepository,
    private readonly airportsRepository: AirportsRepository,
  ) {}

  async execute(command: CreateGateCommand): Promise<void> {
    const { airportId, gateId, data } = command;

    if (!(await this.airportsRepository.exists(airportId))) {
      throw new AirportNotFoundError();
    }

    if (!(await this.terminalsRepository.exists(airportId, data.terminalId))) {
      throw new TerminalNotFoundError();
    }

    await this.gatesRepository.create(airportId, gateId, data);
  }
}
