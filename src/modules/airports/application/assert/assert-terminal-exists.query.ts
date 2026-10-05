import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { AirportsRepository } from '../../infra/database/airports.repository';
import { TerminalsRepository } from '../../infra/database/terminals.repository';
import { AirportNotFoundError } from '../../model/error/airport.error';
import { TerminalNotFoundError } from '../../model/error/terminal.error';

export class AssertTerminalExistsQuery {
  constructor(
    public readonly airportId: string,
    public readonly terminalId: string,
  ) {}
}

@QueryHandler(AssertTerminalExistsQuery)
export class AssertTerminalExistsHandler implements IQueryHandler<AssertTerminalExistsQuery> {
  constructor(
    private readonly airportsRepository: AirportsRepository,
    private readonly terminalsRepository: TerminalsRepository,
  ) {}

  async execute(query: AssertTerminalExistsQuery): Promise<void> {
    const { airportId, terminalId } = query;

    if (!(await this.airportsRepository.exists(airportId))) {
      throw new AirportNotFoundError();
    }

    if (!(await this.terminalsRepository.exists(airportId, terminalId))) {
      throw new TerminalNotFoundError();
    }
  }
}
