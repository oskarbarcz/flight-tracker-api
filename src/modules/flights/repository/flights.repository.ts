import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  Flight,
  FlightPathElement,
  FlightStatus,
} from '../entity/flight.entity';
import { PrismaService } from '../../../core/provider/prisma/prisma.service';
import { CreateFlightRequest } from '../dto/flight.dto';
import { v4 } from 'uuid';
import { FullTimesheet } from '../entity/timesheet.entity';
import { Loadsheets } from '../entity/loadsheet.entity';
import {
  AdsbFlightTrack,
  AdsbPositionReportApiInput,
  deduplicatePositionReports,
  transformPositionReport,
} from '../../../core/provider/adsb/type/adsb.types';
import {
  DepartureAirportNotFoundError,
  DestinationAirportNotFoundError,
} from '../dto/errors.dto';
import { AppConfig } from '../../../config/app.config';
import { deepClone } from '../utils/flight.utils';

export const flightWithAircraftAndAirportsFields = {
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
          continent: true,
          location: true,
        },
      },
    },
  },
} as const satisfies Prisma.FlightSelect;

const flightIdAndCallsign = {
  id: true,
  callsign: true,
} as const satisfies Prisma.FlightSelect;

export type FlightWithAircraftAndAirports = Prisma.FlightGetPayload<{
  select: typeof flightWithAircraftAndAirportsFields;
}>;

export type FlightIdAndCallsign = Prisma.FlightGetPayload<{
  select: typeof flightIdAndCallsign;
}>;

@Injectable()
export class FlightsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    input: CreateFlightRequest,
  ): Promise<FlightWithAircraftAndAirports> {
    const flightId = v4();

    if (!(await this.airportExist(input.departureAirportId))) {
      throw new NotFoundException(DepartureAirportNotFoundError);
    }

    if (!(await this.airportExist(input.destinationAirportId))) {
      throw new NotFoundException(DestinationAirportNotFoundError);
    }

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
        timesheet: deepClone(input.timesheet),
        loadsheets: deepClone(loadsheets),
      },
    });

    await this.prisma.airportsOnFlights.create({
      data: {
        airportId: input.departureAirportId,
        flightId: flightId,
        airportType: AppConfig.airports.types.DEPARTURE,
      },
    });

    await this.prisma.airportsOnFlights.create({
      data: {
        airportId: input.destinationAirportId,
        flightId: flightId,
        airportType: AppConfig.airports.types.DESTINATION,
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

  async getFlightPath(flightId: string): Promise<FlightPathElement[]> {
    const data = await this.prisma.flight.findUnique({
      where: { id: flightId },
      select: { positionReports: true },
    });

    if (!data) {
      throw new NotFoundException('Flight with given id does not exist.');
    }

    const positionReports =
      data.positionReports as unknown as AdsbPositionReportApiInput[];

    return positionReports.map((report) => transformPositionReport(report));
  }

  async getOneById(id: string): Promise<FlightWithAircraftAndAirports> {
    const flight = await this.findOneBy({ id });
    if (!flight) {
      throw new Error(`Flight with id ${id} not found.`);
    }

    return flight;
  }

  async findAllTrackable(): Promise<FlightIdAndCallsign[]> {
    const trackableStatuses = [
      FlightStatus.TaxiingOut,
      FlightStatus.InCruise,
      FlightStatus.TaxiingIn,
    ];

    return this.prisma.flight.findMany({
      where: { status: { in: trackableStatuses } },
      select: flightIdAndCallsign,
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
        loadsheets: deepClone(loadsheets),
      },
    });
  }

  async updateTimesheet(id: string, timesheet: FullTimesheet): Promise<void> {
    await this.prisma.flight.update({
      where: { id },
      data: {
        timesheet: deepClone(timesheet),
      },
    });
  }

  async updateFlightPath(id: string, track: AdsbFlightTrack): Promise<void> {
    const currentPath = await this.getFlightPath(id);
    const newPath = deduplicatePositionReports([...currentPath, ...track]);

    await this.prisma.flight.update({
      where: { id },
      data: { positionReports: newPath },
    });
  }

  private async airportExist(airportId: string): Promise<boolean> {
    const count = await this.prisma.airport.count({
      where: { id: airportId },
    });

    return count === 1;
  }
}
