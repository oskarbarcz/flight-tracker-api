import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { NotFoundError } from '../../../../core/errors/domain-error';
import { FindTerminalQuery } from '../../../airports/application/query/terminal/find-terminal.query';
import { UpdateTerminalCommand } from '../../../airports/application/command/terminals/update-terminal.command';
import { GetTerminalResponse } from '../../../airports/infra/http/request/terminal.dto';
import { ChangeRequestTarget } from '../../model/change-request-target';
import {
  ChangeRequestChanges,
  ChangeRequestResource,
} from '../../model/change-request.model';
import {
  TERMINAL_FIELDS,
  TerminalValues,
} from '../../model/terminal-change.model';
import { ChangeRequestTargetNotFoundError } from '../../model/error/change-request.error';

type TerminalResource = typeof ChangeRequestResource.terminal;

@Injectable()
export class TerminalChangeRequestTarget implements ChangeRequestTarget<TerminalResource> {
  readonly resource = ChangeRequestResource.terminal;
  readonly fields = TERMINAL_FIELDS;

  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  async validate(targetId: string): Promise<void> {
    await this.find(targetId);
  }

  async read(targetId: string): Promise<TerminalValues> {
    const terminal = await this.find(targetId).catch((error) => {
      if (error instanceof NotFoundError) {
        throw new ChangeRequestTargetNotFoundError();
      }
      throw error;
    });

    return {
      shortName: terminal.shortName,
      fullName: terminal.fullName,
      averageTaxiTime: terminal.averageTaxiTime,
      operatorCodes: terminal.operatorCodes,
      text: terminal.text ?? null,
      shape: terminal.shape ?? null,
    };
  }

  async apply(
    targetId: string,
    changes: ChangeRequestChanges<TerminalResource>,
  ): Promise<void> {
    const terminal = await this.find(targetId);

    const command = new UpdateTerminalCommand(
      terminal.airportId,
      targetId,
      changes,
    );
    await this.commandBus.execute(command);
  }

  private find(terminalId: string): Promise<GetTerminalResponse> {
    const query = new FindTerminalQuery(terminalId);
    return this.queryBus.execute(query);
  }
}
