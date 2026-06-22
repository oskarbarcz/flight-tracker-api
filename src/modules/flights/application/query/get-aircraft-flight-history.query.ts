import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { FlightsRepository } from '../../infra/database/repository/flights.repository';
import { FlightStatus } from '../../model/flight.model';
import { FullTimesheet } from '../../model/timesheet.model';
import { AirportType } from '../../../airports/model/airport.model';
import {
  FlightHistoryAirport,
  FlightHistoryEntry,
} from '../../infra/http/request/flight-history.dto';

type AircraftFlightHistoryResult = {
  flights: FlightHistoryEntry[];
  totalCount: number;
};

export class GetAircraftFlightHistoryQuery extends Query<AircraftFlightHistoryResult> {
  constructor(public readonly aircraftId: string) {
    super();
  }
}

@QueryHandler(GetAircraftFlightHistoryQuery)
export class GetAircraftFlightHistoryHandler implements IQueryHandler<GetAircraftFlightHistoryQuery> {
  constructor(private readonly repository: FlightsRepository) {}

  async execute(
    query: GetAircraftFlightHistoryQuery,
  ): Promise<AircraftFlightHistoryResult> {
    const { flights, totalCount } =
      await this.repository.findHistoryByAircraftId(query.aircraftId);

    return {
      flights: flights.map((flight): FlightHistoryEntry => {
        const findAirport = (type: AirportType): FlightHistoryAirport => {
          const match = flight.airports.find(
            (entry) => entry.airportType === type,
          )!.airport;

          return { id: match.id, name: match.name, iataCode: match.iataCode };
        };

        return {
          flightNumber: flight.flightNumber,
          status: flight.status as FlightStatus,
          departureAirport: findAirport(AirportType.Departure),
          arrivalAirport: findAirport(AirportType.Destination),
          actualTimesheet: (flight.timesheet as FullTimesheet).actual ?? null,
        };
      }),
      totalCount,
    };
  }
}
