import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { NotFoundError } from '../../../../core/errors/domain-error';
import { FindRunwayQuery } from '../../../airports/application/query/runway/find-runway.query';
import { UpdateRunwayCommand } from '../../../airports/application/command/runways/update-runway.command';
import { GetRunwayResponse } from '../../../airports/infra/http/request/runway.dto';
import {
  AirportSummaries,
  ChangeRequestTarget,
} from '../../model/change-request-target';
import {
  ChangeRequestChanges,
  ChangeRequestResource,
  ChangeRequestTargetSummary,
} from '../../model/change-request.model';
import { RUNWAY_FIELDS, RunwayValues } from '../../model/runway-change.model';
import { FieldReferences } from '../../model/change-request.diff';
import { ChangeRequestTargetNotFoundError } from '../../model/error/change-request.error';
import { nullWhenNotFound, summarizeTarget } from './target-summary';

type RunwayResource = typeof ChangeRequestResource.runway;

@Injectable()
export class RunwayChangeRequestTarget implements ChangeRequestTarget<RunwayResource> {
  readonly resource = ChangeRequestResource.runway;
  readonly fields = RUNWAY_FIELDS;
  readonly references: FieldReferences<RunwayValues> = {};

  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  async validate(targetId: string): Promise<void> {
    await this.find(targetId);
  }

  async read(targetId: string): Promise<RunwayValues> {
    const runway = await this.find(targetId).catch((error) => {
      if (error instanceof NotFoundError) {
        throw new ChangeRequestTargetNotFoundError();
      }
      throw error;
    });

    return {
      designator: runway.designator,
      length: runway.length,
      width: runway.width,
      displace: runway.displace ?? null,
      trueHeading: runway.trueHeading ?? null,
      magneticHeading: runway.magneticHeading,
      elevation: runway.elevation ?? null,
      surfaceType: runway.surfaceType,
      lightingType: runway.lightingType,
      coordinates: runway.coordinates,
    };
  }

  async describe(
    targetId: string,
    airports: AirportSummaries,
  ): Promise<ChangeRequestTargetSummary | null> {
    const runway = await nullWhenNotFound(this.find(targetId));

    return (
      runway && summarizeTarget(airports, runway.airportId, runway.designator)
    );
  }

  async apply(
    targetId: string,
    changes: ChangeRequestChanges<RunwayResource>,
  ): Promise<void> {
    const runway = await this.find(targetId);

    const command = new UpdateRunwayCommand(
      runway.airportId,
      targetId,
      changes,
    );
    await this.commandBus.execute(command);
  }

  private find(runwayId: string): Promise<GetRunwayResponse> {
    const query = new FindRunwayQuery(runwayId);
    return this.queryBus.execute(query);
  }
}
