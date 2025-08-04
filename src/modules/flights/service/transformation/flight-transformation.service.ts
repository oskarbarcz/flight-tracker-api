import { Injectable } from '@nestjs/common';
import { Flight, FlightStatus } from '../../entity/flight.entity';
import { FullTimesheet } from '../../entity/timesheet.entity';
import { Loadsheets } from '../../entity/loadsheet.entity';
import { mapAirportsWithType } from '../../utils/flight.utils';
import { FlightWithAircraftAndAirports } from '../../repository/flights.repository';

@Injectable()
export class FlightTransformationService {
  /**
   * Transforms database flight entity to domain Flight object
   */
  transformFlightFromDatabase(flight: FlightWithAircraftAndAirports): Flight {
    return {
      id: flight.id,
      flightNumber: flight.flightNumber,
      callsign: flight.callsign,
      status: flight.status as FlightStatus,
      timesheet: flight.timesheet as FullTimesheet,
      loadsheets: flight.loadsheets as unknown as Loadsheets,
      aircraft: flight.aircraft,
      operator: flight.operator,
      airports: mapAirportsWithType(flight.airports),
    };
  }

  /**
   * Transforms multiple database flight entities to domain Flight objects
   */
  transformFlightsFromDatabase(flights: FlightWithAircraftAndAirports[]): Flight[] {
    return flights.map(flight => this.transformFlightFromDatabase(flight));
  }
}