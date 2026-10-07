import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { NotFoundError } from '../../../../core/errors/domain-error';
import { FindGateQuery } from '../../../airports/application/query/gate/find-gate.query';
import { AssertTerminalBelongsToAirportQuery } from '../../../airports/application/assert/assert-terminal-belongs-to-airport.query';
import { AssertParkingPositionExistsQuery } from '../../../airports/application/assert/assert-parking-position-exists.query';
import { UpdateGateCommand } from '../../../airports/application/command/gates/update-gate.command';
import { GetGateResponse } from '../../../airports/infra/http/request/gate.dto';
import {
  AirportSummaries,
  ChangeRequestTarget,
} from '../../model/change-request-target';
import {
  ChangeRequestChanges,
  ChangeRequestResource,
  ChangeRequestTargetSummary,
} from '../../model/change-request.model';
import { GATE_FIELDS, GateValues } from '../../model/gate-change.model';
import { FieldReferences } from '../../model/change-request.diff';
import { ChangeRequestTargetNotFoundError } from '../../model/error/change-request.error';
import { nullWhenNotFound, summarizeTarget } from './target-summary';
import { parkingPositionName, terminalShortName } from './reference-labels';

type GateResource = typeof ChangeRequestResource.gate;

@Injectable()
export class GateChangeRequestTarget implements ChangeRequestTarget<GateResource> {
  readonly resource = ChangeRequestResource.gate;
  readonly fields = GATE_FIELDS;
  readonly references: FieldReferences<GateValues> = {
    terminalId: (terminalId) => terminalShortName(this.queryBus, terminalId),
    parkingPositionId: (parkingPositionId) =>
      parkingPositionName(this.queryBus, parkingPositionId),
  };

  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  async validate(
    targetId: string,
    changes: ChangeRequestChanges<GateResource>,
  ): Promise<void> {
    const gate = await this.find(targetId);

    if (changes.terminalId !== undefined) {
      const query = new AssertTerminalBelongsToAirportQuery(
        gate.airportId,
        changes.terminalId,
      );
      await this.queryBus.execute(query);
    }

    if (changes.parkingPositionId != null) {
      const query = new AssertParkingPositionExistsQuery(
        gate.airportId,
        changes.parkingPositionId,
      );
      await this.queryBus.execute(query);
    }
  }

  async read(targetId: string): Promise<GateValues> {
    const gate = await this.find(targetId).catch((error) => {
      if (error instanceof NotFoundError) {
        throw new ChangeRequestTargetNotFoundError();
      }
      throw error;
    });

    return {
      name: gate.name,
      category: gate.category,
      terminalId: gate.terminalId,
      parkingPositionId: gate.parkingPositionId ?? null,
      coordinates: gate.coordinates ?? null,
    };
  }

  async describe(
    targetId: string,
    airports: AirportSummaries,
  ): Promise<ChangeRequestTargetSummary | null> {
    const gate = await nullWhenNotFound(this.find(targetId));

    return gate && summarizeTarget(airports, gate.airportId, gate.name);
  }

  async apply(
    targetId: string,
    changes: ChangeRequestChanges<GateResource>,
  ): Promise<void> {
    const gate = await this.find(targetId);

    const command = new UpdateGateCommand(gate.airportId, targetId, changes);
    await this.commandBus.execute(command);
  }

  private find(gateId: string): Promise<GetGateResponse> {
    const query = new FindGateQuery(gateId);
    return this.queryBus.execute(query);
  }
}
