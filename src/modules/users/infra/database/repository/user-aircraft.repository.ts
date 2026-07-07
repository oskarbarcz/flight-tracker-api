import { Injectable } from '@nestjs/common';
import { Prisma } from 'prisma/client/client';
import { PrismaService } from '../../../../../core/provider/prisma/prisma.service';
import {
  UserAircraftEntry,
  UserAircraftFlightAirport,
} from '../../../model/user-aircraft.model';
import { findAirframeByType } from '../../../../airframes/data/airframes';
import { AirframeNotFoundError } from '../../../../airframes/model/error/airframe.error';
import { AirportType } from '../../../../airports/model/airport.model';

const operatorSelect = {
  id: true,
  icaoCode: true,
  iataCode: true,
  shortName: true,
  fullName: true,
  callsign: true,
} as const;

const userAircraftSelect = {
  aircraft: {
    select: { id: true, registration: true, type: true, livery: true },
  },
  flight: {
    select: {
      id: true,
      flightNumber: true,
      operator: { select: operatorSelect },
      airports: {
        select: {
          airportType: true,
          airport: { select: { id: true, iataCode: true } },
        },
      },
    },
  },
} as const satisfies Prisma.UserAircraftSelect;

type UserAircraftRow = Prisma.UserAircraftGetPayload<{
  select: typeof userAircraftSelect;
}>;

@Injectable()
export class UserAircraftRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    userId: string;
    aircraftId: string;
    flightId: string;
  }): Promise<void> {
    await this.prisma.userAircraft.create({ data });
  }

  async findByUser(userId: string): Promise<UserAircraftEntry[]> {
    const rows = await this.prisma.userAircraft.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: userAircraftSelect,
    });

    return rows.map((row) => this.toModel(row));
  }

  private toModel(row: UserAircraftRow): UserAircraftEntry {
    const airframe = findAirframeByType(row.aircraft.type);

    if (!airframe) {
      throw new AirframeNotFoundError();
    }

    const findAirport = (type: AirportType): UserAircraftFlightAirport => {
      const match = row.flight.airports.find(
        (entry) => entry.airportType === type,
      )!.airport;

      return { id: match.id, iataCode: match.iataCode };
    };

    return {
      id: row.aircraft.id,
      registration: row.aircraft.registration,
      airframe,
      livery: row.aircraft.livery,
      operator: row.flight.operator,
      flight: {
        id: row.flight.id,
        flightNumber: row.flight.flightNumber,
        departureAirport: findAirport(AirportType.Departure),
        arrivalAirport: findAirport(AirportType.Destination),
      },
    };
  }
}
