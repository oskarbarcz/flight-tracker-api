import {
  FlightSource,
  FlightStatus,
  FlightTracking,
} from '../../model/flight.model';
import { QueryHandler, Query, IQueryHandler, QueryBus } from '@nestjs/cqrs';
import { FlightsRepository } from '../../infra/database/repository/flights.repository';
import { GetPilotQuery } from '../../../users/application/query/get-pilot.query';
import { FlightPilotDto } from '../../../users/infra/http/request/get-user.dto';
import { FullTimesheet } from '../../model/timesheet.model';
import { Loadsheets } from '../../model/loadsheet.model';
import {
  AirportType,
  AirportWithType,
  Continent,
  Coordinates,
} from '../../../airports/model/airport.model';
import {
  GetFlightResponse,
  FlightListFilters,
} from '../../infra/http/request/flight.dto';

type ListAllFlightsResult = {
  flights: GetFlightResponse[];
  totalCount: number;
};

export class ListAllFlightsQuery extends Query<ListAllFlightsResult> {
  constructor(
    public readonly onlyPublic: boolean,
    public readonly filters?: FlightListFilters,
  ) {
    super();
  }
}

@QueryHandler(ListAllFlightsQuery)
export class ListAllFlightsHandler implements IQueryHandler<ListAllFlightsQuery> {
  constructor(
    private repository: FlightsRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(query: ListAllFlightsQuery) {
    const { flights, totalCount } = await this.repository.findAll(
      query.filters,
      query.onlyPublic,
    );

    const pilotsById = await this.resolvePilots(
      flights.map((flight) => flight.captainId),
    );

    return {
      flights: flights.map(
        ({ captainId, ...flight }): GetFlightResponse => ({
          ...flight,
          status: flight.status as FlightStatus,
          timesheet: flight.timesheet as FullTimesheet,
          loadsheets: flight.loadsheets as unknown as Loadsheets,
          airports: flight.airports.map(
            (airportOnFlight): AirportWithType => ({
              ...airportOnFlight.airport,
              location: airportOnFlight.airport
                .location as unknown as Coordinates,
              continent: airportOnFlight.airport.continent as Continent,
              shape: airportOnFlight.airport.shape as unknown as
                | Coordinates[]
                | null,
              type: airportOnFlight.airportType as AirportType,
            }),
          ),
          source: flight.source as FlightSource,
          tracking: flight.tracking as FlightTracking,
          pilot: captainId ? (pilotsById.get(captainId) ?? null) : null,
        }),
      ),
      totalCount,
    };
  }

  /**
   * Resolves each distinct captain once through the cached single-pilot query.
   * Repeated lookups are cheap cache reads, so no batching is needed.
   */
  private async resolvePilots(
    captainIds: (string | null)[],
  ): Promise<Map<string, FlightPilotDto>> {
    const distinctIds = [
      ...new Set(captainIds.filter((id): id is string => id !== null)),
    ];

    const pilots = await Promise.all(
      distinctIds.map(
        (id): Promise<FlightPilotDto | null> =>
          this.queryBus.execute(new GetPilotQuery(id)),
      ),
    );

    const pilotsById = new Map<string, FlightPilotDto>();
    pilots.forEach((pilot) => {
      if (pilot) {
        pilotsById.set(pilot.id, pilot);
      }
    });

    return pilotsById;
  }
}
