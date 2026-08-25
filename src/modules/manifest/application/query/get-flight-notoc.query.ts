import { IQueryHandler, Query, QueryBus, QueryHandler } from '@nestjs/cqrs';
import {
  NotocRepository,
  NotocRow,
} from '../../infra/database/repository/notoc.repository';
import {
  FlightNotoc,
  NotocDocument,
  NotocStageName,
} from '../../model/notoc.model';
import { notocChanges } from '../../model/notoc-delta';
import {
  NotocNotIssuedError,
  NotocReadableByCaptainOnlyError,
} from '../../model/error/notoc.error';
import {
  FlightManifestContext,
  GetFlightManifestContextQuery,
} from '../../../flights/application/query/get-flight-manifest-context.query';
import { UserRole } from '../../../users/model/user-role';
import { NotocStage } from 'prisma/client/client';

export class GetFlightNotocQuery extends Query<FlightNotoc> {
  constructor(
    public readonly flightId: string,
    public readonly actorId: string,
    public readonly actorRole: string,
    public readonly stage?: NotocStageName,
  ) {
    super();
  }
}

@QueryHandler(GetFlightNotocQuery)
export class GetFlightNotocHandler implements IQueryHandler<GetFlightNotocQuery> {
  constructor(
    private readonly notocRepository: NotocRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(query: GetFlightNotocQuery): Promise<FlightNotoc> {
    const { flightId, actorId, actorRole, stage } = query;

    const flight: FlightManifestContext = await this.queryBus.execute(
      new GetFlightManifestContextQuery(flightId),
    );

    if (
      actorRole === UserRole.CabinCrew.toLowerCase() &&
      flight.captainId !== actorId
    ) {
      throw new NotocReadableByCaptainOnlyError();
    }

    const row = stage
      ? await this.notocRepository.findByStage(
          flightId,
          stage as unknown as NotocStage,
        )
      : await this.notocRepository.findLatest(flightId);

    if (!row) {
      throw new NotocNotIssuedError();
    }

    return {
      flightId,
      stage: row.stage as unknown as NotocStageName,
      issuedAt: row.issuedAt,
      acknowledgedById: row.acknowledgedById,
      acknowledgedAt: row.acknowledgedAt,
      document: row.document as unknown as NotocDocument,
      changes: await this.changesOn(flightId, row),
    };
  }

  private async changesOn(flightId: string, row: NotocRow) {
    if (row.stage !== NotocStage.final) {
      return null;
    }

    const preliminary = await this.notocRepository.findByStage(
      flightId,
      NotocStage.preliminary,
    );

    if (!preliminary) {
      return null;
    }

    return notocChanges(
      preliminary.document as unknown as NotocDocument,
      row.document as unknown as NotocDocument,
    );
  }
}
