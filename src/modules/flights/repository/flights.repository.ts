import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Flight,
  FlightPathElement,
  FlightPhase,
  FlightSource,
  FlightStatus,
} from '../entity/flight.entity';
import { PrismaService } from '../../../core/provider/prisma/prisma.service';
import { CreateFlightRequest, FlightListFilters } from '../dto/flight.dto';
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
import { Prisma } from '../../../../prisma/client/client';

export const flightWithAircraftAndAirportsFields = {
  id: true,
  flightNumber: true,
  callsign: true,
  atcCallsign: true,
  status: true,
  timesheet: true,
  loadsheets: true,
  rotationId: true,
  source: true,
  tracking: true,
  createdAt: true,
  operator: {
    select: {
      id: true,
      icaoCode: true,
      iataCode: true,
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
          iataCode: true,
          shortName: true,
          fullName: true,
          callsign: true,
        },
      },
    },
  },
  airports: {
    orderBy: { airportType: 'asc' },
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

export type DiversionStatus = {
  isFlightDiverted: boolean;
};

export type FlightResponse = FlightWithAircraftAndAirports & DiversionStatus;

type FlightsWithCount = {
  flights: FlightResponse[];
  totalCount: number;
};

@Injectable()
export class FlightsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    flightId: string,
    flightData: CreateFlightRequest,
    source: FlightSource = FlightSource.Manual,
  ): Promise<void> {
    if (!(await this.airportExist(flightData.departureAirportId))) {
      throw new NotFoundException(DepartureAirportNotFoundError);
    }

    if (!(await this.airportExist(flightData.destinationAirportId))) {
      throw new NotFoundException(DestinationAirportNotFoundError);
    }

    const loadsheets = {
      preliminary: flightData.loadsheets.preliminary,
      final: null,
    };

    await this.prisma.flight.create({
      data: {
        id: flightId,
        flightNumber: flightData.flightNumber,
        callsign: flightData.callsign,
        atcCallsign: flightData.atcCallsign,
        aircraftId: flightData.aircraftId,
        status: FlightStatus.Created,
        operatorId: flightData.operatorId,
        source,
        tracking: flightData.tracking,
        timesheet: JSON.parse(JSON.stringify(flightData.timesheet)),
        loadsheets: JSON.parse(JSON.stringify(loadsheets)),
      },
    });

    await this.prisma.airportsOnFlights.create({
      data: {
        airportId: flightData.departureAirportId,
        flightId: flightId,
        airportType: 'departure',
      },
    });

    await this.prisma.airportsOnFlights.create({
      data: {
        airportId: flightData.destinationAirportId,
        flightId: flightId,
        airportType: 'destination',
      },
    });
  }

  async findOneBy(
    criteria: Partial<Record<keyof Flight, any>>,
  ): Promise<FlightResponse | null> {
    const flight = await this.prisma.flight.findFirst({
      where: criteria,
      select: flightWithAircraftAndAirportsFields,
    });

    if (!flight) {
      return null;
    }

    return {
      ...flight,
      isFlightDiverted: await this.isFlightDiverted(flight.id),
    };
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

    return positionReports.map(transformPositionReport);
  }

  async getOneById(id: string): Promise<FlightResponse> {
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

  async findAll(filters?: FlightListFilters): Promise<FlightsWithCount> {
    const where: Prisma.FlightWhereInput = {};

    if (filters?.phase === FlightPhase.Upcoming) {
      where.status = {
        in: [FlightStatus.Created, FlightStatus.Ready],
      };
    } else if (filters?.phase === FlightPhase.Ongoing) {
      where.status = {
        in: [
          FlightStatus.CheckedIn,
          FlightStatus.BoardingStarted,
          FlightStatus.BoardingFinished,
          FlightStatus.TaxiingOut,
          FlightStatus.InCruise,
          FlightStatus.TaxiingIn,
          FlightStatus.OnBlock,
          FlightStatus.OffboardingStarted,
          FlightStatus.OffboardingFinished,
        ],
      };
    } else if (filters?.phase === FlightPhase.Finished) {
      where.status = FlightStatus.Closed;
    }

    const [flights, totalCount] = await Promise.all([
      this.prisma.flight.findMany({
        where,
        select: flightWithAircraftAndAirportsFields,
        skip: filters ? (filters.page - 1) * filters.limit : undefined,
        take: filters ? filters.limit : undefined,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.flight.count({ where }),
    ]);

    const flightIds = flights.map((f) => f.id);
    const diversions = await this.prisma.diversion.findMany({
      where: { flightId: { in: flightIds } },
      select: { flightId: true },
    });
    const divertedFlightIds = new Set(diversions.map((d) => d.flightId));

    return {
      flights: flights.map((flight) => ({
        ...flight,
        isFlightDiverted: divertedFlightIds.has(flight.id),
      })),
      totalCount,
    };
  }

  async remove(id: string): Promise<void> {
    await this.prisma.airportsOnFlights.deleteMany({ where: { flightId: id } });
    await this.prisma.flightEvent.deleteMany({ where: { flightId: id } });
    await this.prisma.flight.delete({ where: { id } });
  }

  async checkInCaptain(flightId: string, captainId: string): Promise<void> {
    await this.prisma.flight.update({
      where: { id: flightId },
      data: { captainId },
    });
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

  private async isFlightDiverted(flightId: string): Promise<boolean> {
    const count = await this.prisma.diversion.count({
      where: { flightId },
    });

    return count > 0;
  }

  public async exists(flightId: string): Promise<boolean> {
    const count = await this.prisma.flight.count({ where: { id: flightId } });
    return count > 0;
  }
}
