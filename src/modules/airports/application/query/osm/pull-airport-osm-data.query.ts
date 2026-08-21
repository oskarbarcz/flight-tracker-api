import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { AirportsRepository } from '../../../infra/database/airports.repository';
import { OsmAirportDataService } from '../../../infra/service/osm-airport-data.service';
import { Coordinates } from '../../../model/airport.model';
import { buildProposal, summarize } from '../../../model/osm-upgrade.diff';
import { AirportOsmProposal } from '../../../model/osm-upgrade.model';

export class PullAirportOsmDataQuery extends Query<AirportOsmProposal> {
  constructor(
    public readonly airportId: string,
    public readonly refresh: boolean = false,
  ) {
    super();
  }
}

@QueryHandler(PullAirportOsmDataQuery)
export class PullAirportOsmDataHandler implements IQueryHandler<PullAirportOsmDataQuery> {
  constructor(
    private readonly airportsRepository: AirportsRepository,
    private readonly osmAirportData: OsmAirportDataService,
  ) {}

  async execute(query: PullAirportOsmDataQuery): Promise<AirportOsmProposal> {
    const { airportId, refresh } = query;

    const airport = await this.airportsRepository.findById(airportId);

    const retained = refresh
      ? null
      : await this.osmAirportData.retained(airportId);

    const pull =
      retained ??
      (await this.osmAirportData.pull(
        airportId,
        airport.icaoCode,
        new Date().toISOString(),
      ));

    const snapshot = await this.osmAirportData.snapshot(airportId);
    const current = {
      ...snapshot.current,
      location: airport.location as unknown as Coordinates,
      shape: airport.shape as unknown as Coordinates[] | null,
    };

    const changes = buildProposal(pull.data, current);

    return {
      airportId,
      icaoCode: airport.icaoCode,
      source: pull.data.source,
      providerName: pull.data.name,
      pulledAt: pull.pulledAt,
      fromCache: retained !== null,
      summary: summarize(changes),
      changes,
    };
  }
}
