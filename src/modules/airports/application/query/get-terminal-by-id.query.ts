import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { TerminalsRepository } from '../../infra/database/terminals.repository';
import { GetTerminalResponse } from '../../infra/http/request/terminal.dto';

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
  constructor(private readonly repository: TerminalsRepository) {}

  async execute(query: GetTerminalByIdQuery): Promise<GetTerminalResponse> {
    const terminal = await this.repository.findOne(
      query.airportId,
      query.terminalId,
    );

    return {
      ...terminal,
      operatorCodes: terminal.operatorCodes as string[],
    };
  }
}
