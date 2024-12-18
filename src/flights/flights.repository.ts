import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Flight, FlightStatus } from './entities/flight.entity';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFlightRequest } from './dto/create-flight.dto';
import { v4 } from 'uuid';
import { Schedule, ScheduledTimesheet } from './entities/timesheet.entity';

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
export class FlightsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    input: CreateFlightRequest,
  ): Promise<FlightWithAircraftAndAirports> {
    const flightId = v4();

    await this.prisma.flight.create({
      data: {
        id: flightId,
        flightNumber: input.flightNumber,
        callsign: input.callsign,
        aircraftId: input.aircraftId,
        status: FlightStatus.Created,
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

  async remove(id: string): Promise<void> {
    await this.prisma.airportsOnFlights.deleteMany({ where: { flightId: id } });
    await this.prisma.flight.delete({ where: { id } });
  }

  async updateStatus(id: string, status: FlightStatus): Promise<void> {
    await this.prisma.flight.update({
      where: { id },
      data: { status },
    });
  }

  async updateScheduleTimesheet(id: string, schedule: Schedule): Promise<void> {
    const timesheet: ScheduledTimesheet = { scheduled: schedule };

    await this.prisma.flight.update({
      where: { id },
      data: {
        timesheet: JSON.parse(JSON.stringify(timesheet)),
      },
    });
  }
}
