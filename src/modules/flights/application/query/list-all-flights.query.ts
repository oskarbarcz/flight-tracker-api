import { FlightSource, FlightStatus } from '../../entity/flight.entity';
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
import { GetFlightResponse } from '../../dto/flight.dto';

export class ListAllFlightsQuery extends Query<GetFlightResponse[]> {
  constructor() {
    super();
  }
}

@QueryHandler(ListAllFlightsQuery)
export class ListAllFlightsHandler implements IQueryHandler<ListAllFlightsQuery> {
  constructor(private repository: FlightsRepository) {}

  async execute() {
    const flights = await this.repository.findAll();

    return flights.map(
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
        createdAt: flight.createdAt,
      }),
    );
  }
}
