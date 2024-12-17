import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  Flight,
  Flight as FlightModel,
} from '../flights/entities/flight.entity';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFlightRequest } from './dto/create-flight.dto';
import { v4 } from 'uuid';
import {
  AirportType,
  AirportWithType,
} from '../airports/entities/airport.entity';
import { FullTimesheet } from './entities/timesheet.entity';

type FlightWithAircraftAndAirports = Prisma.FlightGetPayload<{
  include: {
    aircraft: true;
    airports: {
      include: {
        airport: true;
      };
    };
  };
}>;

@Injectable()
export class FlightsService {
  constructor(private readonly prisma: PrismaService) {}
  async findOne(id: string): Promise<Flight> {
    const flight: FlightWithAircraftAndAirports | null = await this.findOneBy({
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
    if (input.departureAirportId === input.destinationAirportId) {
      throw new Error('Departure and destination airports must be different.');
    }

    const flightId = v4();

    await this.prisma.flight.create({
      data: {
        id: flightId,
        flightNumber: input.flightNumber,
        callsign: input.callsign,
        aircraftId: input.aircraftId,
        status: 'ready',
        timesheet: JSON.parse(JSON.stringify(input.timesheet)),
      },
    });

    await this.prisma.airportsOnFlights.create({
      data: {
        airportId: input.departureAirportId,
        flightId: flightId,
        airportType: 'departure',
      },
    });

    await this.prisma.airportsOnFlights.create({
      data: {
        airportId: input.destinationAirportId,
        flightId: flightId,
        airportType: 'destination',
      },
    });

    return this.findOne(flightId);
  }

  private async findOneBy(
    criteria: Partial<Record<keyof FlightModel, any>>,
  ): Promise<FlightWithAircraftAndAirports | null> {
    return this.prisma.flight.findFirst({
      where: criteria,
      include: {
        aircraft: true,
        airports: {
          include: {
            airport: true,
          },
        },
      },
    });
  }
}
