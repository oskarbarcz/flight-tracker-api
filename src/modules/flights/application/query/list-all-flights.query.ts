import {
  FlightSource,
  FlightStatus,
  FlightTracking,
} from '../../model/flight.model';
import { QueryHandler, Query, IQueryHandler } from '@nestjs/cqrs';
import { FlightsRepository } from '../../infra/database/repository/flights.repository';
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
  constructor(private repository: FlightsRepository) {}

  async execute(query: ListAllFlightsQuery) {
    const { flights, totalCount } = await this.repository.findAll(
      query.filters,
      query.onlyPublic,
    );

    return {
      flights: flights.map(
        (flight): GetFlightResponse => ({
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
              type: airportOnFlight.airportType as AirportType,
            }),
          ),
          source: flight.source as FlightSource,
          tracking: flight.tracking as FlightTracking,
        }),
      ),
      totalCount,
    };
  }
}
