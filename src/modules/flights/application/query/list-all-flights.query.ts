import {
  FlightServiceType,
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
  DataQuality,
} from '../../../airports/model/airport.model';
import {
  GetFlightResponse,
  FlightListFilters,
} from '../../infra/http/request/flight.dto';
import { FlightsWithNotocQuery } from '../../../manifest/application/query/has-flight-notoc.query';
import { toCountryRef } from '../../../countries/model/country.model';

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

    const [pilotsById, flightsWithNotoc] = await Promise.all([
      this.resolvePilots(flights.map((flight) => flight.captainId)),
      this.resolveFlightsWithNotoc(flights.map((flight) => flight.id)),
    ]);

    return {
      flights: flights.map(
        ({ captainId, actualFuelBurned, ...flight }): GetFlightResponse => ({
          ...flight,
          status: flight.status as FlightStatus,
          timesheet: flight.timesheet as FullTimesheet,
          loadsheets: flight.loadsheets as unknown as Loadsheets,
          actualFuelBurned:
            actualFuelBurned === null ? null : actualFuelBurned.toNumber(),
          airports: flight.airports.map(
            (airportOnFlight): AirportWithType => ({
              ...airportOnFlight.airport,
              location: airportOnFlight.airport
                .location as unknown as Coordinates,
              country: toCountryRef(airportOnFlight.airport.country),
              continent: airportOnFlight.airport.continent as Continent,
              dataQuality: airportOnFlight.airport.dataQuality as DataQuality,
              shape: airportOnFlight.airport.shape as unknown as
                | Coordinates[]
                | null,
              type: airportOnFlight.airportType as AirportType,
            }),
          ),
          source: flight.source as FlightSource,
          tracking: flight.tracking as FlightTracking,
          serviceType: flight.serviceType as FlightServiceType,
          pilot: captainId ? (pilotsById.get(captainId) ?? null) : null,
          hasNotoc: flightsWithNotoc.has(flight.id),
        }),
      ),
      totalCount,
    };
  }

  private async resolveFlightsWithNotoc(
    flightIds: string[],
  ): Promise<Set<string>> {
    const notocQuery = new FlightsWithNotocQuery(flightIds);

    return this.queryBus.execute(notocQuery);
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
