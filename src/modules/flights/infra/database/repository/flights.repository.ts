import { Injectable } from '@nestjs/common';
import {
  Flight,
  FlightOfpDetails,
  FlightPathElement,
  FlightPhase,
  FlightSource,
  FlightStatus,
  FlightTracking,
} from '../../../model/flight.model';
import { PrismaService } from '../../../../../core/provider/prisma/prisma.service';
import {
  CreateFlightRequest,
  FlightListFilters,
} from '../../http/request/flight.dto';
import { FilledTimesheet, FullTimesheet } from '../../../model/timesheet.model';
import { Loadsheets } from '../../../model/loadsheet.model';
import {
  AdsbFlightTrack,
  AdsbPositionReportApiInput,
  deduplicatePositionReports,
  transformPositionReport,
} from '../../../../../core/provider/adsb/type/adsb.types';
import {
  AlternateAirportNotFoundError,
  DepartureAirportNotFoundError,
  DestinationAirportNotFoundError,
  FlightDoesNotExistError,
  FlightOfpNotFoundError,
} from '../../../model/error/flight.error';
import { UnresolvedEmergencyCannotCloseFlightError } from '../../../model/error/emergency.error';
import { Continent, Prisma } from '../../../../../../prisma/client/client';
import { Airframe } from '../../../../airframes/model/airframe.model';
import { findAirframeByType } from '../../../../airframes/data/airframes';
import { AirframeNotFoundError } from '../../../../airframes/model/error/airframe.error';
import { AirportType } from '../../../../airports/model/airport.model';

export const flightWithAircraftAndAirportsFields = {
  id: true,
  flightNumber: true,
  callsign: true,
  atcCallsign: true,
  isEtops: true,
  status: true,
  timesheet: true,
  loadsheets: true,
  captainId: true,
  source: true,
  tracking: true,
  createdAt: true,
  departureParkingPositionId: true,
  departureRunwayId: true,
  arrivalParkingPositionId: true,
  arrivalRunwayId: true,
  isEmergencyDeclared: true,
  isDiversionDeclared: true,
  isPathAvailable: true,
  actualFuelBurned: true,
  delayRequest: { select: { id: true } },
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
      type: true,
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
          shape: true,
        },
      },
    },
  },
} as const satisfies Prisma.FlightSelect;

const flightHistoryFields = {
  id: true,
  flightNumber: true,
  status: true,
  timesheet: true,
  airports: {
    select: {
      airportType: true,
      airport: { select: { id: true, name: true, iataCode: true } },
    },
  },
} as const satisfies Prisma.FlightSelect;

export type FlightHistoryRow = Prisma.FlightGetPayload<{
  select: typeof flightHistoryFields;
}>;

const flightOfp = {
  ofpContent: true,
  ofpDocumentUrl: true,
  runwayAnalysis: true,
} as const satisfies Prisma.FlightSelect;

const flightIdAndCallsign = {
  id: true,
  callsign: true,
} as const satisfies Prisma.FlightSelect;

const repositionFlightFields = {
  source: true,
  greatCircleDistance: true,
  airports: {
    select: {
      airportType: true,
      airport: { select: { id: true, location: true } },
    },
  },
} as const satisfies Prisma.FlightSelect;

const flightCompletionStatsFields = {
  captainId: true,
  greatCircleDistance: true,
  totalFuelBurned: true,
  timesheet: true,
} as const satisfies Prisma.FlightSelect;

type RepositionAirport = {
  id: string;
  location: { latitude: number; longitude: number };
};

export type RepositionFlightData = {
  source: Prisma.FlightGetPayload<{
    select: typeof repositionFlightFields;
  }>['source'];
  greatCircleDistance: number;
  departure: RepositionAirport;
  destination: RepositionAirport;
};

export type FlightCompletionStats = {
  captainId: string | null;
  greatCircleDistance: number;
  totalFuelBurned: number;
  timesheet: FilledTimesheet;
};

export type CaptainFlightFact = {
  flightId: string;
  completedAt: Date;
  greatCircleDistance: number;
  fuelBurned: number;
  airborneMinutes: number | null;
  blockMinutes: number | null;
  aircraftType: string;
  operatorId: string;
  airports: {
    airportId: string;
    icaoCode: string;
    country: string;
    continent: Continent;
  }[];
};

type FlightWithRawAircraft = Prisma.FlightGetPayload<{
  select: typeof flightWithAircraftAndAirportsFields;
}>;

type RawAircraft = FlightWithRawAircraft['aircraft'];
type AircraftWithAirframe = Omit<RawAircraft, 'type'> & { airframe: Airframe };

export type FlightWithAircraftAndAirports = Omit<
  FlightWithRawAircraft,
  'aircraft'
> & { aircraft: AircraftWithAirframe };

export type FlightIdAndCallsign = Prisma.FlightGetPayload<{
  select: typeof flightIdAndCallsign;
}>;

export type DerivedFlightStatus = {
  isFlightDiverted: boolean;
  isEmergencyDeclared: boolean;
  hasFlightPath: boolean;
  isOffBlockDelayed: boolean;
};

export type FlightResponse = Omit<
  FlightWithAircraftAndAirports,
  'isDiversionDeclared' | 'isPathAvailable' | 'delayRequest'
> &
  DerivedFlightStatus;

function expandAircraftAirframe(aircraft: RawAircraft): AircraftWithAirframe {
  const airframe = findAirframeByType(aircraft.type);

  if (!airframe) {
    throw new AirframeNotFoundError();
  }

  return {
    id: aircraft.id,
    airframe,
    registration: aircraft.registration,
    selcal: aircraft.selcal,
    livery: aircraft.livery,
    operator: aircraft.operator,
  };
}

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
  ): Promise<void> {
    if (!(await this.airportExist(flightData.departureAirportId))) {
      throw new DepartureAirportNotFoundError();
    }

    if (!(await this.airportExist(flightData.destinationAirportId))) {
      throw new DestinationAirportNotFoundError();
    }

    const alternateAirports = flightData.alternateAirports ?? [];

    for (const alternate of alternateAirports) {
      if (!(await this.airportExist(alternate.airportId))) {
        throw new AlternateAirportNotFoundError();
      }
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
        isEtops: flightData.isEtops,
        operatorId: flightData.operatorId,
        tracking: flightData.tracking,
        status: FlightStatus.Created,
        timesheet: JSON.parse(JSON.stringify(flightData.timesheet)),
        loadsheets: JSON.parse(JSON.stringify(loadsheets)),
      },
    });

    const airportRows = [
      {
        airportId: flightData.departureAirportId,
        flightId,
        airportType: AirportType.Departure,
      },
      {
        airportId: flightData.destinationAirportId,
        flightId,
        airportType: AirportType.Destination,
      },
      ...alternateAirports.map((alternate) => ({
        airportId: alternate.airportId,
        flightId,
        airportType: alternate.type,
      })),
    ];

    // Departure and destination are listed first so that, on a composite-key
    // collision (an alternate that equals the origin/destination, or a repeated
    // alternate), skipDuplicates keeps the primary airport type.
    await this.prisma.airportsOnFlights.createMany({
      data: airportRows,
      skipDuplicates: true,
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

    const { isDiversionDeclared, isPathAvailable, delayRequest, ...rest } =
      flight;
    return {
      ...rest,
      aircraft: expandAircraftAirframe(flight.aircraft),
      isFlightDiverted: isDiversionDeclared,
      hasFlightPath: isPathAvailable,
      isOffBlockDelayed: delayRequest !== null,
    };
  }

  async getFlightTracking(id: string): Promise<FlightTracking | undefined> {
    const flight = await this.prisma.flight.findUnique({
      select: { tracking: true },
      where: { id },
    });

    return flight?.tracking as FlightTracking | undefined;
  }

  async getFlightPath(flightId: string): Promise<FlightPathElement[]> {
    const data = await this.prisma.flight.findUnique({
      where: { id: flightId },
      select: { positionReports: true },
    });

    if (!data) {
      throw new FlightDoesNotExistError();
    }

    const positionReports =
      data.positionReports as unknown as AdsbPositionReportApiInput[];

    return positionReports.map(transformPositionReport);
  }

  async getOfpByFlightId(id: string): Promise<FlightOfpDetails> {
    const data = await this.prisma.flight.findUnique({
      where: {
        id,
        ofpDocumentUrl: { not: null },
        ofpContent: { not: null },
        runwayAnalysis: { not: null },
      },
      select: flightOfp,
    });

    if (!data) {
      throw new FlightOfpNotFoundError();
    }

    return data as FlightOfpDetails;
  }

  async findById(id: string): Promise<FlightResponse> {
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

  async findAwaitingFirstPosition(): Promise<FlightIdAndCallsign[]> {
    const preDepartureStatuses = [
      FlightStatus.CheckedIn,
      FlightStatus.BoardingStarted,
      FlightStatus.BoardingFinished,
    ];

    return this.prisma.flight.findMany({
      where: {
        status: { in: preDepartureStatuses },
        isPathAvailable: false,
      },
      select: flightIdAndCallsign,
    });
  }

  async findAwaitingOffBlock(): Promise<FlightIdAndCallsign[]> {
    return this.prisma.flight.findMany({
      where: {
        status: FlightStatus.BoardingFinished,
        isPathAvailable: true,
      },
      select: flightIdAndCallsign,
    });
  }

  async findAll(
    filters?: FlightListFilters,
    onlyPublic?: boolean,
  ): Promise<FlightsWithCount> {
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
    } else if (filters?.phase === FlightPhase.Emergency) {
      where.emergency = { some: { resolvedAt: null } };
    }

    if (onlyPublic) {
      where.tracking = FlightTracking.Public;
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

    return {
      flights: flights.map(
        ({ isDiversionDeclared, isPathAvailable, delayRequest, ...rest }) => ({
          ...rest,
          aircraft: expandAircraftAirframe(rest.aircraft),
          isFlightDiverted: isDiversionDeclared,
          hasFlightPath: isPathAvailable,
          isOffBlockDelayed: delayRequest !== null,
        }),
      ),
      totalCount,
    };
  }

  async findHistoryByAircraftId(
    aircraftId: string,
  ): Promise<{ flights: FlightHistoryRow[]; totalCount: number }> {
    const where: Prisma.FlightWhereInput = { aircraftId };

    const [flights, totalCount] = await Promise.all([
      this.prisma.flight.findMany({
        where,
        select: flightHistoryFields,
        // newest first; flightNumber + id keep the order stable when flights
        // share a createdAt
        orderBy: [
          { createdAt: 'desc' },
          { flightNumber: 'asc' },
          { id: 'asc' },
        ],
      }),
      this.prisma.flight.count({ where }),
    ]);

    return { flights, totalCount };
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

  async close(id: string, actualFuelBurned: number | null): Promise<void> {
    await this.prisma.flight.update({
      where: { id },
      data: { status: FlightStatus.Closed, actualFuelBurned },
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

  async updateCompletionFacts(
    id: string,
    facts: {
      actualAirborneMinutes: number | null;
      actualBlockMinutes: number | null;
      completedAt: Date | null;
    },
  ): Promise<void> {
    await this.prisma.flight.update({
      where: { id },
      data: facts,
    });
  }

  async updateSimbriefData(
    id: string,
    ofp: FlightOfpDetails,
    simbriefRequestId: number,
    simbriefSequenceId: string,
    greatCircleDistance: number,
    totalFuelBurned: number,
  ): Promise<void> {
    await this.prisma.flight.update({
      where: { id },
      data: {
        source: FlightSource.Simbrief,
        ofpContent: ofp.ofpContent,
        ofpDocumentUrl: ofp.ofpDocumentUrl,
        runwayAnalysis: ofp.runwayAnalysis,
        simbriefRequestId,
        simbriefSequenceId,
        greatCircleDistance,
        totalFuelBurned,
      },
    });
  }

  async updateVisibility(
    id: string,
    visibility: FlightTracking,
  ): Promise<void> {
    await this.prisma.flight.update({
      where: { id },
      data: { tracking: visibility },
    });
  }

  async updateFlightPath(
    id: string,
    track: AdsbFlightTrack,
  ): Promise<{ isFirstReceipt: boolean }> {
    const currentPath = await this.getFlightPath(id);
    const newPath = deduplicatePositionReports([...currentPath, ...track]);
    const isFirstReceipt = currentPath.length === 0 && newPath.length > 0;

    await this.prisma.flight.update({
      where: { id },
      data: {
        positionReports: newPath,
        ...(isFirstReceipt && { isPathAvailable: true }),
      },
    });

    return { isFirstReceipt };
  }

  private async airportExist(airportId: string): Promise<boolean> {
    const count = await this.prisma.airport.count({
      where: { id: airportId },
    });

    return count === 1;
  }

  public async assertNoUnresolvedEmergency(flightId: string): Promise<void> {
    const count = await this.prisma.emergencyDeclaration.count({
      where: { flightId, resolvedAt: null },
    });
    if (count > 0) {
      throw new UnresolvedEmergencyCannotCloseFlightError();
    }
  }

  public async exists(flightId: string): Promise<boolean> {
    const count = await this.prisma.flight.count({ where: { id: flightId } });
    return count > 0;
  }

  async updateDepartureParkingPosition(
    flightId: string,
    departureParkingPositionId: string,
  ): Promise<void> {
    await this.prisma.flight.update({
      where: { id: flightId },
      data: { departureParkingPositionId },
    });
  }

  async updateDepartureRunway(
    flightId: string,
    departureRunwayId: string,
  ): Promise<void> {
    await this.prisma.flight.update({
      where: { id: flightId },
      data: { departureRunwayId },
    });
  }

  async updateArrivalParkingPosition(
    flightId: string,
    arrivalParkingPositionId: string,
  ): Promise<void> {
    await this.prisma.flight.update({
      where: { id: flightId },
      data: { arrivalParkingPositionId },
    });
  }

  async updateArrivalRunway(
    flightId: string,
    arrivalRunwayId: string,
  ): Promise<void> {
    await this.prisma.flight.update({
      where: { id: flightId },
      data: { arrivalRunwayId },
    });
  }

  async getArrivalParkingPositionId(flightId: string): Promise<string | null> {
    const flight = await this.prisma.flight.findUnique({
      where: { id: flightId },
      select: { arrivalParkingPositionId: true },
    });

    return flight?.arrivalParkingPositionId ?? null;
  }

  async getRepositionData(
    flightId: string,
  ): Promise<RepositionFlightData | null> {
    const flight = await this.prisma.flight.findUnique({
      where: { id: flightId },
      select: repositionFlightFields,
    });

    const departure = flight?.airports.find(
      (a) => a.airportType === AirportType.Departure,
    );
    const destination = flight?.airports.find(
      (a) => a.airportType === AirportType.Destination,
    );

    if (!flight || !departure || !destination) {
      return null;
    }

    return {
      source: flight.source,
      greatCircleDistance: flight.greatCircleDistance,
      departure: {
        id: departure.airport.id,
        location: departure.airport.location as unknown as {
          latitude: number;
          longitude: number;
        },
      },
      destination: {
        id: destination.airport.id,
        location: destination.airport.location as unknown as {
          latitude: number;
          longitude: number;
        },
      },
    };
  }

  async getCompletionStats(flightId: string): Promise<FlightCompletionStats> {
    const flight = await this.prisma.flight.findUnique({
      where: { id: flightId },
      select: flightCompletionStatsFields,
    });

    if (!flight) {
      throw new FlightDoesNotExistError();
    }

    return {
      captainId: flight.captainId,
      greatCircleDistance: flight.greatCircleDistance,
      totalFuelBurned: flight.totalFuelBurned,
      timesheet: flight.timesheet as FilledTimesheet,
    };
  }

  async getCompletedFlightsByCaptain(
    captainId: string,
  ): Promise<CaptainFlightFact[]> {
    const flights = await this.prisma.flight.findMany({
      where: { captainId, completedAt: { not: null } },
      select: {
        id: true,
        completedAt: true,
        greatCircleDistance: true,
        totalFuelBurned: true,
        actualAirborneMinutes: true,
        actualBlockMinutes: true,
        operatorId: true,
        aircraft: { select: { type: true } },
        airports: {
          select: {
            airport: {
              select: {
                id: true,
                icaoCode: true,
                country: true,
                continent: true,
              },
            },
          },
        },
      },
    });

    return flights.map((flight) => ({
      flightId: flight.id,
      completedAt: flight.completedAt as Date,
      greatCircleDistance: flight.greatCircleDistance,
      fuelBurned: flight.totalFuelBurned,
      airborneMinutes: flight.actualAirborneMinutes,
      blockMinutes: flight.actualBlockMinutes,
      aircraftType: flight.aircraft.type,
      operatorId: flight.operatorId,
      airports: flight.airports.map((entry) => ({
        airportId: entry.airport.id,
        icaoCode: entry.airport.icaoCode,
        country: entry.airport.country,
        continent: entry.airport.continent,
      })),
    }));
  }
}
