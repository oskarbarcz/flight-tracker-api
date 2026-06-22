import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../../http/request/create-user.dto';
import { UpdateUserDto } from '../../http/request/update-user.dto';
import { v4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../../../core/provider/prisma/prisma.service';
import {
  GetUserDto,
  ListUsersFilters,
  GetUserStatsResponse,
} from '../../http/request/get-user.dto';
import { OnEvent } from '@nestjs/event-emitter';
import {
  FlightEventType,
  PilotCheckedInEvent,
  OnBlockWasReportedEvent,
  FlightWasClosedEvent,
} from '../../../../../core/domain/events/dto/flight.events';
import { User } from '../../../../../../prisma/client/client';
import { UserRole } from '../../../../../../prisma/client/enums';
import {
  FilledSchedule,
  FilledTimesheet,
} from '../../../../flights/model/timesheet.model';
import { scheduleToBlockTimeInMinutes } from '../../../../flights/infra/helper/dates';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { CACHE_KEYS, cacheByUser } from '../../../../../core/cache/cache.key';
import {
  CabinCrewMustHaveHomeAirportError,
  OnlyCabinCrewCanHaveHomeAirportError,
  OnlyCabinCrewCanHavePilotLicenseError,
  UserEmailAlreadyExistsError,
  UserNotFoundError,
} from '../../../model/error/user.error';

@Injectable()
export class UsersRepository {
  BCRYPT_SALT_ROUNDS = 12;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly prisma: PrismaService,
  ) {}

  async create(data: CreateUserDto): Promise<GetUserDto> {
    const userWithSameEmail = await this.findOneBy({
      email: data.email,
    });

    if (userWithSameEmail) {
      throw new UserEmailAlreadyExistsError();
    }

    if (data.role !== UserRole.CabinCrew && data.pilotLicenseId) {
      throw new OnlyCabinCrewCanHavePilotLicenseError();
    }

    if (data.role !== UserRole.CabinCrew && data.homeAirportId) {
      throw new OnlyCabinCrewCanHaveHomeAirportError();
    }

    if (data.role === UserRole.CabinCrew && !data.homeAirportId) {
      throw new CabinCrewMustHaveHomeAirportError();
    }

    const hashedPassword = await bcrypt.hash(
      data.password,
      this.BCRYPT_SALT_ROUNDS,
    );

    const user: User = await this.prisma.user.create({
      data: {
        id: v4(),
        ...data,
        currentFlightId: null,
        password: hashedPassword,
        lastAirportId: data.homeAirportId ?? null,
        lastAirportUpdatedAt: null,
      },
    });

    return this.returnWithoutPassword(user);
  }

  async findAll(filters: ListUsersFilters): Promise<GetUserDto[]> {
    const users = await this.prisma.user.findMany({
      where: filters,
    });

    return users.map((user) => this.returnWithoutPassword(user));
  }

  async findOne(id: string): Promise<GetUserDto> {
    const user: User | null = await this.findOneBy({ id });

    if (!user) {
      throw new UserNotFoundError();
    }

    return this.returnWithoutPassword(user);
  }

  async getUserStats(id: string): Promise<GetUserStatsResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        totalGreatCircleDistance: true,
        totalFuelBurned: true,
        totalFlightTime: true,
      },
    });

    if (!user) {
      throw new UserNotFoundError();
    }

    return {
      total: {
        ...user,
        blockTime: user.totalFlightTime,
      },
    };
  }

  async findByCredentials(
    email: string,
    password: string,
  ): Promise<GetUserDto | null> {
    const user = await this.findOneBy({ email });

    if (!user) {
      return null;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    return !isMatch ? null : this.returnWithoutPassword(user);
  }

  async update(id: string, data: UpdateUserDto): Promise<GetUserDto> {
    const user: User | null = await this.findOneBy({ id });

    if (!user) {
      throw new UserNotFoundError();
    }

    const newRole = data.role ?? user.role;
    if (newRole !== UserRole.CabinCrew && data.pilotLicenseId) {
      throw new OnlyCabinCrewCanHavePilotLicenseError();
    }

    if (newRole !== UserRole.CabinCrew && data.homeAirportId) {
      throw new OnlyCabinCrewCanHaveHomeAirportError();
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data,
    });

    if (data.password) {
      const hashedPassword = await bcrypt.hash(
        data.password,
        this.BCRYPT_SALT_ROUNDS,
      );

      await this.prisma.user.update({
        where: { id },
        data: { password: hashedPassword },
      });
    }

    return this.returnWithoutPassword(updatedUser);
  }

  @OnEvent(FlightEventType.PilotCheckedIn)
  async onFlightCheckedIn(event: PilotCheckedInEvent): Promise<void> {
    await this.prisma.user.update({
      where: { id: event.payload.actorId as string },
      data: { currentFlightId: event.payload.flightId },
    });

    if (!event.payload.rotationId) {
      return;
    }

    await this.prisma.user.update({
      where: { id: event.payload.actorId as string },
      data: { currentRotationId: event.payload.rotationId },
    });
  }

  @OnEvent(FlightEventType.OnBlockWasReported)
  async onOnBlockWasReported(event: OnBlockWasReportedEvent): Promise<void> {
    const flight = await this.prisma.flight.findFirstOrThrow({
      select: {
        captainId: true,
        greatCircleDistance: true,
        totalFuelBurned: true,
        timesheet: true,
      },
      where: { id: event.payload.flightId },
    });

    const timesheet = flight.timesheet as FilledTimesheet;
    const blockTime = scheduleToBlockTimeInMinutes(
      timesheet.actual as FilledSchedule,
    );

    await this.prisma.user.update({
      where: { id: flight.captainId as string },
      data: {
        totalGreatCircleDistance: { increment: flight.greatCircleDistance },
        totalFuelBurned: { increment: flight.totalFuelBurned },
        totalFlightTime: { increment: blockTime },
        lastAirportId: event.payload.landingAirportId,
        lastAirportUpdatedAt: new Date(),
      },
    });
    // remove user stats from an indefinite cache
    const cacheKey = cacheByUser(
      CACHE_KEYS.USER_STATS,
      flight.captainId as string,
    );
    await this.cacheManager.del(cacheKey);
  }

  @OnEvent(FlightEventType.FlightWasClosed)
  async onFlightClose(event: FlightWasClosedEvent): Promise<void> {
    await this.prisma.user.update({
      where: { id: event.payload.actorId as string },
      data: { currentFlightId: null },
    });

    // flight has no rotation
    if (!event.payload.rotationId) {
      return;
    }

    const lastFlightInRotation = await this.prisma.flight.findFirst({
      select: { id: true },
      where: { rotationId: event.payload.rotationId },
      orderBy: { createdAt: 'desc' },
    });

    // flight is not last in rotation
    if (lastFlightInRotation?.id !== event.payload.flightId) {
      return;
    }

    await this.prisma.user.update({
      where: { id: event.payload.actorId as string },
      data: { currentRotationId: null },
    });
  }

  private async findOneBy(
    criteria: Partial<Record<keyof User, any>>,
  ): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: criteria,
    });
  }

  private returnWithoutPassword(user: User): GetUserDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      pilotLicenseId: user.pilotLicenseId,
      currentFlightId: user.currentFlightId,
      currentRotationId: user.currentRotationId,
      homeAirportId: user.homeAirportId,
      lastAirportId: user.lastAirportId,
      lastAirportUpdatedAt: user.lastAirportUpdatedAt,
    };
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.user.count({ where: { id } });

    return count > 0;
  }
}
