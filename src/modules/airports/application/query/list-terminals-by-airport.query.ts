import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { TerminalsRepository } from '../../infra/database/terminals.repository';
import { GetTerminalResponse } from '../../infra/http/request/terminal.dto';

export class ListTerminalsByAirportQuery extends Query<GetTerminalResponse[]> {
  constructor(public readonly airportId: string) {
    super();
  }
}

@QueryHandler(ListTerminalsByAirportQuery)
export class ListTerminalsByAirportHandler implements IQueryHandler<ListTerminalsByAirportQuery> {
  constructor(private readonly repository: TerminalsRepository) {}

  async execute(
    query: ListTerminalsByAirportQuery,
  ): Promise<GetTerminalResponse[]> {
    const terminals = await this.repository.findAll(query.airportId);

    return terminals.map((terminal) => ({
      ...terminal,
      operatorCodes: terminal.operatorCodes as string[],
    }));
  }
}
