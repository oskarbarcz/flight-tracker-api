import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { TerminalsRepository } from '../../../infra/database/terminals.repository';
import { GetTerminalResponse } from '../../../infra/http/request/terminal.dto';
import { TerminalNotFoundError } from '../../../model/error/terminal.error';
import { toTerminalResponse } from './get-terminal-by-id.query';

export class FindTerminalQuery extends Query<GetTerminalResponse> {
  constructor(public readonly terminalId: string) {
    super();
  }
}

@QueryHandler(FindTerminalQuery)
export class FindTerminalHandler implements IQueryHandler<FindTerminalQuery> {
  constructor(private readonly terminalsRepository: TerminalsRepository) {}

  async execute(query: FindTerminalQuery): Promise<GetTerminalResponse> {
    const terminal = await this.terminalsRepository.findOneBy({
      id: query.terminalId,
    });

    if (!terminal) {
      throw new TerminalNotFoundError();
    }

    return toTerminalResponse(terminal);
  }
}
