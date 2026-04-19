import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { TerminalsRepository } from '../../../infra/database/terminals.repository';
import { GetTerminalResponse } from '../../../infra/http/request/terminal.dto';
import { AirportsRepository } from '../../../infra/database/airports.repository';
import { AirportNotFoundError } from '../../../model/error/airport.error';

export class ListTerminalsByAirportQuery extends Query<GetTerminalResponse[]> {
  constructor(public readonly airportId: string) {
    super();
  }
}

@QueryHandler(ListTerminalsByAirportQuery)
export class ListTerminalsByAirportHandler implements IQueryHandler<ListTerminalsByAirportQuery> {
  constructor(
    private readonly terminalsRepository: TerminalsRepository,
    private readonly airportsRepository: AirportsRepository,
  ) {}

  async execute(
    query: ListTerminalsByAirportQuery,
  ): Promise<GetTerminalResponse[]> {
    if (!(await this.airportsRepository.exists(query.airportId))) {
      throw new AirportNotFoundError();
    }

    const terminals = await this.terminalsRepository.findAll(query.airportId);

    return terminals.map((terminal) => ({
      ...terminal,
      operatorCodes: terminal.operatorCodes as string[],
    }));
  }
}
