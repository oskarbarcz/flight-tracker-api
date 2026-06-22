import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../../http/request/create-user.dto';
import { UpdateUserDto } from '../../http/request/update-user.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../../../core/provider/prisma/prisma.service';
import {
  GetUserDto,
  ListUsersFilters,
  GetUserStatsResponse,
} from '../../http/request/get-user.dto';
import { User } from '../../../../../../prisma/client/client';
import { UserRole } from '../../../../../../prisma/client/enums';
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

  async create(id: string, data: CreateUserDto): Promise<void> {
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

    await this.prisma.user.create({
      data: {
        id,
        ...data,
        currentFlightId: null,
        password: hashedPassword,
        lastAirportId: data.homeAirportId ?? null,
        lastAirportUpdatedAt: null,
      },
    });
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

  async update(id: string, data: UpdateUserDto): Promise<void> {
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

    await this.prisma.user.update({
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
  }

  async setCurrentFlight(
    userId: string,
    flightId: string | null,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { currentFlightId: flightId },
    });
  }

  async setCurrentRotation(
    userId: string,
    rotationId: string | null,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { currentRotationId: rotationId },
    });
  }

  async addCompletedFlightStats(
    userId: string,
    stats: {
      greatCircleDistance: number;
      totalFuelBurned: number;
      blockTime: number;
    },
    landingAirportId: string,
    landedAt: Date,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        totalGreatCircleDistance: { increment: stats.greatCircleDistance },
        totalFuelBurned: { increment: stats.totalFuelBurned },
        totalFlightTime: { increment: stats.blockTime },
        lastAirportId: landingAirportId,
        lastAirportUpdatedAt: landedAt,
      },
    });
    // remove user stats from an indefinite cache
    const cacheKey = cacheByUser(CACHE_KEYS.USER_STATS, userId);
    await this.cacheManager.del(cacheKey);
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
