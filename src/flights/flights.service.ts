import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Flight, FlightStatus } from './entities/flight.entity';
import { CreateFlightRequest } from './dto/create-flight.dto';
import {
  AirportType,
  AirportWithType,
} from '../airports/entities/airport.entity';
import { FullTimesheet } from './entities/timesheet.entity';
import { AirportsService } from '../airports/airports.service';
import { FlightsRepository } from './flights.repository';
import { AircraftService } from '../aircraft/aircraft.service';
import {
  AircraftNotFoundError,
  DepartureAirportNotFoundError,
  DestinationAirportNotFoundError,
  DestinationAirportSameAsDepartureAirportError,
} from './dto/create-flight-error';

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
      status: flight.status as FlightStatus,
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

  async create(input: CreateFlightRequest): Promise<Flight> {
    if (input.departureAirportId === input.destinationAirportId) {
      throw new BadRequestException(
        DestinationAirportSameAsDepartureAirportError,
      );
    }

    if (!(await this.aircraftService.exists(input.aircraftId))) {
      throw new NotFoundException(AircraftNotFoundError);
    }

    if (!(await this.airportsService.exists(input.departureAirportId))) {
      throw new NotFoundException(DepartureAirportNotFoundError);
    }

    if (!(await this.airportsService.exists(input.destinationAirportId))) {
      throw new NotFoundException(DestinationAirportNotFoundError);
    }

    const flight = await this.flightsRepository.create(input);

    return {
      id: flight.id,
      flightNumber: flight.flightNumber,
      callsign: flight.callsign,
      status: flight.status as FlightStatus,
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
}
