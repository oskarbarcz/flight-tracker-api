import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { TerminalsRepository } from '../../../infra/database/terminals.repository';
import { GetTerminalResponse } from '../../../infra/http/request/terminal.dto';
import { AirportsRepository } from '../../../infra/database/airports.repository';
import { AirportNotFoundError } from '../../../model/error/airport.error';
import { TerminalNotFoundError } from '../../../model/error/terminal.error';
import { Coordinates } from '../../../model/airport.model';

export class GetTerminalByIdQuery extends Query<GetTerminalResponse> {
  constructor(
    public readonly airportId: string,
    public readonly terminalId: string,
  ) {
    super();
  }
}

@QueryHandler(GetTerminalByIdQuery)
export class GetTerminalByIdHandler implements IQueryHandler<GetTerminalByIdQuery> {
  constructor(
    private readonly terminalsRepository: TerminalsRepository,
    private readonly airportsRepository: AirportsRepository,
  ) {}

  async execute(query: GetTerminalByIdQuery): Promise<GetTerminalResponse> {
    const { airportId, terminalId } = query;

    if (!(await this.airportsRepository.exists(airportId))) {
      throw new AirportNotFoundError();
    }

    const terminal = await this.terminalsRepository.findOneBy({
      id: terminalId,
      airportId,
    });

    if (!terminal) {
      throw new TerminalNotFoundError();
    }

    return {
      ...terminal,
      operatorCodes: terminal.operatorCodes as string[],
      shape: terminal.shape as unknown as Coordinates[] | null,
    };
  }
}
