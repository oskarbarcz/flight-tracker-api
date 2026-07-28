import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/provider/prisma/prisma.service';
import {
  AircraftRepositionStatus,
  AircraftRepositionType,
} from 'prisma/client/enums';
import { AircraftReposition } from '../../../model/reposition.model';

const repositionAirportSelect = {
  id: true,
  name: true,
  iataCode: true,
} as const;

const repositionSelect = {
  id: true,
  aircraftId: true,
  type: true,
  status: true,
  distance: true,
  flightId: true,
  createdAt: true,
  updatedAt: true,
  departureAirport: { select: repositionAirportSelect },
  destinationAirport: { select: repositionAirportSelect },
} as const;

type AircraftRepositionRow = {
  id: string;
  aircraftId: string;
  type: AircraftRepositionType;
  status: AircraftRepositionStatus;
  distance: number;
  flightId: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  departureAirport: { id: string; name: string; iataCode: string };
  destinationAirport: { id: string; name: string; iataCode: string };
};

type DeadheadType =
  | typeof AircraftRepositionType.dead_head_manual
  | typeof AircraftRepositionType.dead_head_automatic;

@Injectable()
export class RepositionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createPerformingFlight(
    aircraftId: string,
    flightId: string,
    departureAirportId: string,
    destinationAirportId: string,
    distance: number,
  ): Promise<void> {
    await this.prisma.aircraftReposition.create({
      data: {
        aircraftId,
        flightId,
        type: AircraftRepositionType.performing_flight,
        status: AircraftRepositionStatus.pending,
        departureAirportId,
        destinationAirportId,
        distance,
      },
    });
  }

  async finishPerformingFlight(
    aircraftId: string,
    flightId: string,
  ): Promise<void> {
    await this.prisma.aircraftReposition.updateMany({
      where: {
        aircraftId,
        flightId,
        type: AircraftRepositionType.performing_flight,
        status: AircraftRepositionStatus.pending,
      },
      data: {
        status: AircraftRepositionStatus.finished,
        updatedAt: new Date(),
      },
    });
  }

  async createDeadhead(
    type: DeadheadType,
    aircraftId: string,
    departureAirportId: string,
    destinationAirportId: string,
    distance: number,
    flightId: string | null,
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.aircraftReposition.create({
        data: {
          aircraftId,
          flightId,
          type,
          status: AircraftRepositionStatus.finished,
          departureAirportId,
          destinationAirportId,
          distance,
        },
      }),
      this.prisma.aircraft.update({
        where: { id: aircraftId },
        data: {
          lastAirportId: destinationAirportId,
          lastAirportUpdatedAt: new Date(),
        },
      }),
    ]);
  }

  async findByAircraft(aircraftId: string): Promise<AircraftReposition[]> {
    const repositions = await this.prisma.aircraftReposition.findMany({
      where: { aircraftId },
      orderBy: { createdAt: 'desc' },
      select: repositionSelect,
    });

    return repositions.map((reposition) => this.toModel(reposition));
  }

  private toModel(reposition: AircraftRepositionRow): AircraftReposition {
    return {
      id: reposition.id,
      aircraftId: reposition.aircraftId,
      type: reposition.type,
      status: reposition.status,
      departureAirport: reposition.departureAirport,
      destinationAirport: reposition.destinationAirport,
      distance: reposition.distance,
      flightId: reposition.flightId,
      createdAt: reposition.createdAt,
      updatedAt: reposition.updatedAt,
    };
  }
}
