import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../core/provider/prisma/prisma.service';
import {
  ReportDiversionRequest,
  GetDiversionResponse,
} from '../dto/diversion.dto';
import { Prisma, UserRole } from 'prisma/client/client';
import { JwtUser } from '../../auth/dto/jwt-user.dto';
import {
  DiversionReason,
  DiversionReporterRole,
  DiversionSeverity,
} from '../entity/diversion.entity';
import { FlightStatus } from '../entity/flight.entity';
import { Continent, Coordinates } from '../../airports/entity/airport.entity';

const diversionWithPayloadQuery = {
  id: true,
  severity: true,
  reason: true,
  freeText: true,
  position: true,
  notifySecurityOnGround: true,
  notifyMedicalOnGround: true,
  notifyFirefightersOnGround: true,
  estimatedTimeAtDestination: true,
  decisionTime: true,
  airport: {
    select: {
      id: true,
      icaoCode: true,
      iataCode: true,
      city: true,
      name: true,
      country: true,
      timezone: true,
      location: true,
      continent: true,
    },
  },
} as const satisfies Prisma.DiversionSelect;

export type DiversionWithAirport = Prisma.DiversionGetPayload<{
  select: typeof diversionWithPayloadQuery;
}>;

@Injectable()
export class DiversionRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async create(
    flightId: string,
    currentUser: JwtUser,
    data: ReportDiversionRequest,
  ): Promise<void> {
    if (await this.existsActiveDiversion(flightId)) {
      throw new ConflictException(
        'Active diversion already exists for this flight',
      );
    }

    const flight = await this.prisma.flight.findUnique({
      where: { id: flightId },
    });

    if (!flight) {
      throw new NotFoundException('Flight was not found');
    }

    if (
      flight.status !== FlightStatus.InCruise &&
      flight.status !== FlightStatus.TaxiingOut
    ) {
      throw new BadRequestException(
        'Diversion can be reported to flights in Taxiing Out or In Cruise status only',
      );
    }

    const reporterRole: DiversionReporterRole =
      currentUser.role === UserRole.CabinCrew
        ? DiversionReporterRole.Crew
        : DiversionReporterRole.Operations;

    await this.prisma.diversion.create({
      data: {
        flightId,
        ...data,
        reportedBy: currentUser.sub,
        reporterRole,
        decisionTime: new Date(),
        position: data.position as unknown as Prisma.InputJsonValue,
      },
    });
  }

  public async get(flightId: string): Promise<GetDiversionResponse> {
    const diversion = (await this.prisma.diversion.findUnique({
      where: { flightId },
      select: diversionWithPayloadQuery,
    })) as DiversionWithAirport | null;

    if (!diversion) {
      throw new NotFoundException(
        'Diversion was not reported for this flight.',
      );
    }

    return {
      ...diversion,
      severity: diversion.severity as DiversionSeverity,
      reason: diversion.reason as DiversionReason,
      position: diversion.position as unknown as Coordinates,
      freeText: diversion.freeText as string,
      airport: {
        ...diversion.airport,
        location: diversion.airport.location as unknown as Coordinates,
        continent: diversion.airport.continent as Continent,
      },
    };
  }

  public async existsActiveDiversion(flightId: string): Promise<boolean> {
    const count = await this.prisma.diversion.count({ where: { flightId } });

    return count > 0;
  }
}
