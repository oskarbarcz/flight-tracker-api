import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/provider/prisma/prisma.service';
import {
  GetDiversionResponse,
  ReportDiversionRequest,
  UpdateDiversionRequest,
} from '../../http/request/diversion.dto';
import { Prisma, UserRole } from 'prisma/client/client';
import { JwtUser } from '../../../../auth/infra/http/request/jwt-user.dto';
import {
  DiversionReason,
  DiversionReporterRole,
  DiversionSeverity,
} from '../../../model/diversion.model';
import { FlightStatus } from '../../../model/flight.model';
import {
  Continent,
  Coordinates,
} from '../../../../airports/model/airport.model';
import { FlightDoesNotExistError } from '../../../model/error/flight.error';
import {
  ActiveDiversionAlreadyExistsError,
  DiversionNotFoundError,
  InvalidStatusToReportDiversionError,
} from '../../../model/error/diversion.error';

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
      throw new ActiveDiversionAlreadyExistsError();
    }

    const flight = await this.prisma.flight.findUnique({
      where: { id: flightId },
    });

    if (!flight) {
      throw new FlightDoesNotExistError();
    }

    if (
      flight.status !== FlightStatus.InCruise &&
      flight.status !== FlightStatus.TaxiingOut
    ) {
      throw new InvalidStatusToReportDiversionError();
    }

    const reporterRole: DiversionReporterRole =
      currentUser.role === UserRole.CabinCrew
        ? DiversionReporterRole.Crew
        : DiversionReporterRole.Operations;

    await this.prisma.$transaction([
      this.prisma.diversion.create({
        data: {
          flightId,
          ...data,
          reportedBy: currentUser.sub,
          reporterRole,
          decisionTime: new Date(),
          position: data.position as unknown as Prisma.InputJsonValue,
        },
      }),
      this.prisma.flight.update({
        where: { id: flightId },
        data: { isDiversionDeclared: true },
      }),
    ]);
  }

  public async update(
    flightId: string,
    data: UpdateDiversionRequest,
  ): Promise<void> {
    const { position, ...rest } = data;
    const updateData: Prisma.DiversionUpdateInput = { ...rest };
    if (position !== undefined) {
      updateData.position = position as unknown as Prisma.InputJsonValue;
    }

    await this.prisma.diversion.update({
      where: { flightId },
      data: updateData,
    });
  }

  public async get(flightId: string): Promise<GetDiversionResponse> {
    const diversion = (await this.prisma.diversion.findUnique({
      where: { flightId },
      select: diversionWithPayloadQuery,
    })) as DiversionWithAirport | null;

    if (!diversion) {
      throw new DiversionNotFoundError();
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
