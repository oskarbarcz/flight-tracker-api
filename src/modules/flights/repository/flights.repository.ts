import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Flight, FlightStatus } from '../entity/flight.entity';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { CreateFlightRequest } from '../dto/create-flight.dto';
import { v4 } from 'uuid';
import { FullTimesheet } from '../entity/timesheet.entity';
import { Loadsheets } from '../entity/loadsheet.entity';

export const flightWithAircraftAndAirportsFields =
  Prisma.validator<Prisma.FlightSelect>()({
    id: true,
    flightNumber: true,
    callsign: true,
    status: true,
    timesheet: true,
    loadsheets: true,
    operator: {
      select: {
        id: true,
        icaoCode: true,
        shortName: true,
        fullName: true,
        callsign: true,
      },
    },
    aircraft: {
      select: {
        id: true,
        icaoCode: true,
        shortName: true,
        fullName: true,
        registration: true,
        selcal: true,
        livery: true,
        operator: {
          select: {
            id: true,
            icaoCode: true,
            shortName: true,
            fullName: true,
            callsign: true,
          },
        },
      },
    },
    airports: {
      select: {
        airportType: true,
        airport: {
          select: {
            id: true,
            icaoCode: true,
            iataCode: true,
            city: true,
            name: true,
            country: true,
            timezone: true,
          },
        },
      },
    },
  } as const);

export type FlightWithAircraftAndAirports = Prisma.FlightGetPayload<{
  select: typeof flightWithAircraftAndAirportsFields;
}>;

@Injectable()
export class FlightsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    input: CreateFlightRequest,
  ): Promise<FlightWithAircraftAndAirports> {
    const flightId = v4();

    const loadsheets = {
      preliminary: input.loadsheets.preliminary,
      final: null,
    };

    await this.prisma.flight.create({
      data: {
        id: flightId,
        flightNumber: input.flightNumber,
        callsign: input.callsign,
        aircraftId: input.aircraftId,
        status: FlightStatus.Created,
        operatorId: input.operatorId,
        timesheet: JSON.parse(JSON.stringify(input.timesheet)),
        loadsheets: JSON.parse(JSON.stringify(loadsheets)),
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

    const flight = await this.findOneBy({ id: flightId });

    if (!flight) {
      throw new Error('Flight was not created. Internal error occurred.');
    }

    return flight;
  }

  async findOneBy(
    criteria: Partial<Record<keyof Flight, any>>,
  ): Promise<FlightWithAircraftAndAirports | null> {
    return this.prisma.flight.findFirst({
      where: criteria,
      select: flightWithAircraftAndAirportsFields,
    });
  }

  async findAll(): Promise<FlightWithAircraftAndAirports[]> {
    return this.prisma.flight.findMany({
      select: flightWithAircraftAndAirportsFields,
    });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.airportsOnFlights.deleteMany({ where: { flightId: id } });
    await this.prisma.flightEvent.deleteMany({ where: { flightId: id } });
    await this.prisma.flight.delete({ where: { id } });
  }

  async updateStatus(id: string, status: FlightStatus): Promise<void> {
    await this.prisma.flight.update({
      where: { id },
      data: { status },
    });
  }

  async updateLoadsheets(id: string, loadsheets: Loadsheets): Promise<void> {
    await this.prisma.flight.update({
      where: { id },
      data: {
        loadsheets: JSON.parse(JSON.stringify(loadsheets)),
      },
    });
  }

  async updateTimesheet(id: string, timesheet: FullTimesheet): Promise<void> {
    await this.prisma.flight.update({
      where: { id },
      data: {
        timesheet: JSON.parse(JSON.stringify(timesheet)),
      },
    });
  }
}
