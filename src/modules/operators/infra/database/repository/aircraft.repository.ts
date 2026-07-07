import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/provider/prisma/prisma.service';
import {
  AircraftState as PrismaAircraftState,
  Aircraft as AircraftEntity,
  Prisma,
} from 'prisma/client/client';
import {
  CreateAircraftRequest,
  UpdateAircraftRequest,
} from '../../http/request/aircraft.request';
import { AircraftState } from '../../../model/aircraft.model';

const aircraftWithOperatorFields = {
  id: true,
  type: true,
  registration: true,
  selcal: true,
  livery: true,
  currentState: true,
  baseAirportId: true,
  lastAirportId: true,
  lastAirportUpdatedAt: true,
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
  operatorId: false,
} as const satisfies Prisma.AircraftSelect;

const aircraft = {
  id: true,
  type: true,
  registration: true,
  selcal: true,
  livery: true,
  currentState: true,
  etopsThresholdMinutes: true,
  baseAirport: {
    select: {
      id: true,
      iataCode: true,
      name: true,
      city: true,
      country: true,
      location: true,
    },
  },
  lastAirport: {
    select: {
      id: true,
      iataCode: true,
      name: true,
      city: true,
      country: true,
      location: true,
    },
  },
  lastAirportUpdatedAt: true,
  lastParkingPosition: {
    select: {
      id: true,
      name: true,
      coordinates: true,
    },
  },
  operatorId: false,
} as const satisfies Prisma.AircraftSelect;

export type AircraftWithOperator = Prisma.AircraftGetPayload<{
  select: typeof aircraftWithOperatorFields;
}>;

export type AircraftRow = Prisma.AircraftGetPayload<{
  select: typeof aircraft;
}>;

@Injectable()
export class AircraftRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    id: string,
    operatorId: string,
    data: CreateAircraftRequest,
  ): Promise<void> {
    await this.prisma.aircraft.create({
      data: { id, ...data, operatorId },
    });
  }

  async findAll(): Promise<AircraftWithOperator[]> {
    return this.prisma.aircraft.findMany({
      select: aircraftWithOperatorFields,
    });
  }

  async findAllForOperator(operatorId: string): Promise<AircraftRow[]> {
    return this.prisma.aircraft.findMany({
      where: { operatorId },
      select: aircraft,
    });
  }

  async legacyFindOneBy(
    criteria: Partial<Record<keyof AircraftEntity, any>>,
  ): Promise<AircraftWithOperator | null> {
    return this.prisma.aircraft.findFirst({
      where: criteria,
      select: aircraftWithOperatorFields,
    });
  }

  async findOneBy(
    criteria: Partial<Record<keyof AircraftEntity, any>>,
  ): Promise<AircraftRow | null> {
    return this.prisma.aircraft.findFirst({
      where: criteria,
      select: aircraft,
    });
  }

  async update(id: string, data: UpdateAircraftRequest): Promise<void> {
    await this.prisma.aircraft.update({
      where: { id },
      data: data,
    });
  }

  async updateState(id: string, state: AircraftState): Promise<void> {
    await this.prisma.aircraft.update({
      where: { id },
      data: { currentState: state as unknown as PrismaAircraftState },
    });
  }

  async updateLastLocation(
    id: string,
    airportId: string,
    parkingPositionId: string | null,
    when: Date,
  ): Promise<void> {
    await this.prisma.aircraft.update({
      where: { id },
      data: {
        lastAirportId: airportId,
        lastParkingPositionId: parkingPositionId,
        lastAirportUpdatedAt: when,
      },
    });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.aircraft.delete({ where: { id } });
  }

  async exists(
    criteria: Partial<Record<keyof AircraftRow, any>>,
  ): Promise<boolean> {
    const count = await this.prisma.aircraft.count({
      where: criteria,
    });

    return count > 0;
  }

  async countFlights(aircraftId: string): Promise<number> {
    return this.prisma.flight.count({
      where: { aircraftId },
    });
  }
}
