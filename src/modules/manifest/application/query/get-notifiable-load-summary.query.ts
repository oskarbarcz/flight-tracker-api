import { IQueryHandler, Query, QueryBus, QueryHandler } from '@nestjs/cqrs';
import {
  notifiableLoadSummary,
  NotifiableLoadSummary,
} from '../../model/notoc';
import {
  CargoShipmentStatusName,
  FlightCargoManifest,
} from '../../model/cargo-manifest.model';
import { GetFlightCargoLoadQuery } from './get-flight-cargo-load.query';
import { CargoManifestNotGeneratedError } from '../../model/error/cargo.error';

export class GetNotifiableLoadSummaryQuery extends Query<NotifiableLoadSummary | null> {
  constructor(public readonly flightId: string) {
    super();
  }
}

@QueryHandler(GetNotifiableLoadSummaryQuery)
export class GetNotifiableLoadSummaryHandler implements IQueryHandler<GetNotifiableLoadSummaryQuery> {
  constructor(private readonly queryBus: QueryBus) {}

  async execute(
    query: GetNotifiableLoadSummaryQuery,
  ): Promise<NotifiableLoadSummary | null> {
    const load = new GetFlightCargoLoadQuery(
      query.flightId,
      CargoShipmentStatusName.Loaded,
    );

    try {
      const manifest: FlightCargoManifest = await this.queryBus.execute(load);

      return notifiableLoadSummary(manifest);
    } catch (error) {
      if (error instanceof CargoManifestNotGeneratedError) {
        return null;
      }

      throw error;
    }
  }
}
