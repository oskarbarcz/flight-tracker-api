import { Injectable, NotFoundException } from '@nestjs/common';
import { Flight } from './entities/flight.entity';
import { CreateFlightRequest } from './dto/create-flight.dto';
import {
  AirportType,
  AirportWithType,
} from '../airports/entities/airport.entity';
import { FullTimesheet } from './entities/timesheet.entity';
import { AirportsService } from '../airports/airports.service';
import { FlightsRepository } from './flights.repository';
import { AircraftService } from '../aircraft/aircraft.service';

@Injectable()
export class FlightsService {
  constructor(
    private readonly airportsService: AirportsService,
    private readonly aircraftService: AircraftService,
    private readonly flightsRepository: FlightsRepository,
  ) {}
  async find(id: string): Promise<Flight> {
    const flight = await this.flightsRepository.findOneBy({
      id,
    });

    if (!flight) {
      throw new NotFoundException('Flight with given id does not exist.');
    }

    return {
      id: flight.id,
      flightNumber: flight.flightNumber,
      callsign: flight.callsign,
      status: flight.status,
      timesheet: flight.timesheet as FullTimesheet,
      aircraft: flight.aircraft,
      airports: flight.airports.map(
        (airportOnFlight): AirportWithType => ({
          ...airportOnFlight.airport,
          type: airportOnFlight.airportType as AirportType,
        }),
      ),
    };
  }

  async create(input: CreateFlightRequest) {
    if (!(await this.aircraftService.exists(input.aircraftId))) {
      throw new Error('Aircraft assigned to this flight does not exist.');
    }

    if (input.departureAirportId === input.destinationAirportId) {
      throw new Error('Departure and destination airports must be different.');
    }

    if (!(await this.airportsService.exists(input.departureAirportId))) {
      throw new Error('Departure airport does not exist.');
    }

    if (!(await this.airportsService.exists(input.destinationAirportId))) {
      throw new Error('Destination airport does not exist.');
    }

    return this.flightsRepository.create(input);
  }
}
