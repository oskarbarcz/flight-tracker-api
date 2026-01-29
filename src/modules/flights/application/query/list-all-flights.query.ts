import {
  FlightSource,
  FlightStatus,
  FlightTracking,
} from '../../entity/flight.entity';
import { QueryHandler, Query, IQueryHandler } from '@nestjs/cqrs';
import { FlightsRepository } from '../../repository/flights.repository';
import { FullTimesheet } from '../../entity/timesheet.entity';
import { Loadsheets } from '../../entity/loadsheet.entity';
import {
  AirportType,
  AirportWithType,
  Continent,
  Coordinates,
} from '../../../airports/entity/airport.entity';
import { GetFlightResponse, FlightListFilters } from '../../dto/flight.dto';

type ListAllFlightsResult = {
  flights: GetFlightResponse[];
  totalCount: number;
};

export class ListAllFlightsQuery extends Query<ListAllFlightsResult> {
  constructor(public readonly filters?: FlightListFilters) {
    super();
  }
}

@QueryHandler(ListAllFlightsQuery)
export class ListAllFlightsHandler implements IQueryHandler<ListAllFlightsQuery> {
  constructor(private repository: FlightsRepository) {}

  async execute(query: ListAllFlightsQuery) {
    const { flights, totalCount } = await this.repository.findAll(
      query.filters,
    );

    return {
      flights: flights.map(
        (flight): GetFlightResponse => ({
          id: flight.id,
          flightNumber: flight.flightNumber,
          callsign: flight.callsign,
          status: flight.status as FlightStatus,
          timesheet: flight.timesheet as FullTimesheet,
          loadsheets: flight.loadsheets as unknown as Loadsheets,
          aircraft: flight.aircraft,
          operator: flight.operator,
          airports: flight.airports.map(
            (airportOnFlight): AirportWithType => ({
              ...airportOnFlight.airport,
              location: airportOnFlight.airport
                .location as unknown as Coordinates,
              continent: airportOnFlight.airport.continent as Continent,
              type: airportOnFlight.airportType as AirportType,
            }),
          ),
          isFlightDiverted: flight.isFlightDiverted,
          rotationId: flight.rotationId,
          source: flight.source as FlightSource,
          tracking: flight.tracking as FlightTracking,
          createdAt: flight.createdAt,
        }),
      ),
      totalCount,
    };
  }
}
