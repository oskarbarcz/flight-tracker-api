import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../../../../../core/provider/prisma/prisma.service';
import {
  UserTravelStatus,
  UserTravelType,
} from '../../../../../../prisma/client/enums';
import { UserTravel } from '../../../model/user-travel.model';
import { CACHE_KEYS, cacheByUser } from '../../../../../core/cache/cache.key';

const travelAirportSelect = { id: true, name: true, iataCode: true } as const;

const travelSelect = {
  id: true,
  userId: true,
  type: true,
  status: true,
  distance: true,
  flightId: true,
  createdAt: true,
  updatedAt: true,
  departureAirport: { select: travelAirportSelect },
  destinationAirport: { select: travelAirportSelect },
} as const;

type UserTravelRow = {
  id: string;
  userId: string;
  type: UserTravelType;
  status: UserTravelStatus;
  distance: number;
  flightId: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  departureAirport: { id: string; name: string; iataCode: string };
  destinationAirport: { id: string; name: string; iataCode: string };
};

type DeadheadType =
  | typeof UserTravelType.dead_head_manual
  | typeof UserTravelType.dead_head_automatic;

@Injectable()
export class UserTravelRepository {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async createPerformingFlight(
    userId: string,
    flightId: string,
    departureAirportId: string,
    destinationAirportId: string,
    distance: number,
  ): Promise<void> {
    await this.prisma.userTravel.create({
      data: {
        userId,
        flightId,
        type: UserTravelType.performing_flight,
        status: UserTravelStatus.pending,
        departureAirportId,
        destinationAirportId,
        distance,
      },
    });
  }

  async finishPerformingFlight(
    userId: string,
    flightId: string,
  ): Promise<void> {
    await this.prisma.userTravel.updateMany({
      where: {
        userId,
        flightId,
        type: UserTravelType.performing_flight,
        status: UserTravelStatus.pending,
      },
      data: { status: UserTravelStatus.finished, updatedAt: new Date() },
    });
  }

  async createDeadhead(
    type: DeadheadType,
    userId: string,
    departureAirportId: string,
    destinationAirportId: string,
    distance: number,
    flightId: string | null,
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.userTravel.create({
        data: {
          userId,
          flightId,
          type,
          status: UserTravelStatus.finished,
          departureAirportId,
          destinationAirportId,
          distance,
        },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: {
          lastAirportId: destinationAirportId,
          lastAirportUpdatedAt: new Date(),
        },
      }),
    ]);

    await this.cacheManager.del(cacheByUser(CACHE_KEYS.USER_ME, userId));
  }

  async findByUser(userId: string): Promise<UserTravel[]> {
    const travels = await this.prisma.userTravel.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: travelSelect,
    });

    return travels.map((travel) => this.toModel(travel));
  }

  private toModel(travel: UserTravelRow): UserTravel {
    return {
      id: travel.id,
      userId: travel.userId,
      type: travel.type,
      status: travel.status,
      departureAirport: travel.departureAirport,
      destinationAirport: travel.destinationAirport,
      distance: travel.distance,
      flightId: travel.flightId,
      createdAt: travel.createdAt,
      updatedAt: travel.updatedAt,
    };
  }
}
