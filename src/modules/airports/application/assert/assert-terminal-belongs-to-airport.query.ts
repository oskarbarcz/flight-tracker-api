import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { TerminalsRepository } from '../../infra/database/terminals.repository';
import { TerminalNotFoundError } from '../../model/error/terminal.error';

export class AssertTerminalBelongsToAirportQuery {
  constructor(
    public readonly airportId: string,
    public readonly terminalId: string,
  ) {}
}

@QueryHandler(AssertTerminalBelongsToAirportQuery)
export class AssertTerminalBelongsToAirportHandler implements IQueryHandler<AssertTerminalBelongsToAirportQuery> {
  constructor(private readonly terminalsRepository: TerminalsRepository) {}

  async execute(query: AssertTerminalBelongsToAirportQuery): Promise<void> {
    const { airportId, terminalId } = query;

    if (await this.terminalsRepository.exists(airportId, terminalId)) return;

    throw new TerminalNotFoundError();
  }
}
