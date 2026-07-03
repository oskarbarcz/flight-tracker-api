import { Injectable, NotFoundException } from '@nestjs/common';
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
import { FullTimesheet } from '../../../model/timesheet.model';
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
} from '../../http/request/errors.dto';
import { UnresolvedEmergencyCannotCloseFlightError } from '../../../model/error/emergency.error';
import { Prisma } from '../../../../../../prisma/client/client';
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
  rotationId: true,
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
};

export type FlightResponse = Omit<
  FlightWithAircraftAndAirports,
  'isDiversionDeclared' | 'isPathAvailable'
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

  async getRotationIdByFlightId(flightId: string): Promise<string | null> {
    const flight = await this.prisma.flight.findUnique({
      where: { id: flightId },
      select: { rotationId: true },
    });

    return flight?.rotationId ?? null;
  }

  async create(
    flightId: string,
    flightData: CreateFlightRequest,
  ): Promise<void> {
    if (!(await this.airportExist(flightData.departureAirportId))) {
      throw new NotFoundException(DepartureAirportNotFoundError);
    }

    if (!(await this.airportExist(flightData.destinationAirportId))) {
      throw new NotFoundException(DestinationAirportNotFoundError);
    }

    const alternateAirports = flightData.alternateAirports ?? [];

    for (const alternate of alternateAirports) {
      if (!(await this.airportExist(alternate.airportId))) {
        throw new NotFoundException(AlternateAirportNotFoundError);
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

    const { isDiversionDeclared, isPathAvailable, ...rest } = flight;
    return {
      ...rest,
      aircraft: expandAircraftAirframe(flight.aircraft),
      isFlightDiverted: isDiversionDeclared,
      hasFlightPath: isPathAvailable,
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
      throw new NotFoundException('Flight with given id does not exist.');
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
      throw new NotFoundException(
        'Flight with given id does not exist or no OFP for flight',
      );
    }

    return data as FlightOfpDetails;
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
        ({ isDiversionDeclared, isPathAvailable, ...rest }) => ({
          ...rest,
          aircraft: expandAircraftAirframe(rest.aircraft),
          isFlightDiverted: isDiversionDeclared,
          hasFlightPath: isPathAvailable,
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

  async addRotationForFlight(
    flightId: string,
    rotationId: string,
  ): Promise<void> {
    await Promise.all([
      this.prisma.flight.update({
        where: { id: flightId },
        data: { rotationId },
      }),
      this.prisma.rotation.update({
        where: { id: rotationId },
        data: { updatedAt: new Date() },
      }),
    ]);
  }

  async removeRotationForFlight(
    flightId: string,
    rotationId: string,
  ): Promise<void> {
    await Promise.all([
      this.prisma.flight.update({
        where: { id: flightId },
        data: { rotationId: null },
      }),
      this.prisma.rotation.update({
        where: { id: rotationId },
        data: { updatedAt: new Date() },
      }),
    ]);
  }
}
