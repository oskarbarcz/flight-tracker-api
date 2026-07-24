import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../../http/request/create-user.dto';
import { UpdateUserDto } from '../../http/request/update-user.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../../../core/provider/prisma/prisma.service';
import {
  GetUserDto,
  ListUsersFilters,
  PilotDto,
} from '../../http/request/get-user.dto';
import { User } from '../../../../../../prisma/client/client';
import { UserRole } from '../../../model/user-role';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { CACHE_KEYS, cacheByUser } from '../../../../../core/cache/cache.key';
import {
  CabinCrewMustHaveHomeAirportError,
  OnlyCabinCrewCanHaveHomeAirportError,
  OnlyCabinCrewCanHavePilotLicenseError,
  UserEmailAlreadyExistsError,
  UserNotFoundError,
  UserWithGivenIdNotFoundError,
} from '../../../model/error/user.error';

// Correctness comes from explicit invalidation whenever the underlying user
// changes (profile update, flight completion). The TTL is only a short backstop
// for changes the app can't observe (e.g. an out-of-band DB reset), so it stays
// small to bound staleness rather than acting as the primary cache lifetime.
const PILOT_CARD_TTL_MS = 1000;

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

  async findById(id: string): Promise<GetUserDto> {
    const user: User | null = await this.findOneBy({ id });

    if (!user) {
      throw new UserNotFoundError();
    }

    return this.returnWithoutPassword(user);
  }

  /**
   * Resolves the public pilot card for a user, reading through a per-user cache.
   * The cache is invalidated whenever the underlying fields change (profile
   * update), so callers can read it as often as they need. The lifetime block
   * time is layered on by the query handler from the statistics projection.
   */
  async getPilotCard(id: string): Promise<PilotDto | null> {
    const cacheKey = cacheByUser(CACHE_KEYS.PILOT_CARD, id);

    const cached = await this.cacheManager.get<PilotDto>(cacheKey);
    if (cached) {
      return cached;
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        pilotLicenseId: true,
      },
    });

    if (!user) {
      return null;
    }

    await this.cacheManager.set(cacheKey, user, PILOT_CARD_TTL_MS);
    return user;
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

    // name / pilot license may have changed — drop the cached pilot card
    await this.cacheManager.del(cacheByUser(CACHE_KEYS.PILOT_CARD, id));
    await this.cacheManager.del(cacheByUser(CACHE_KEYS.USER_ME, id));
  }

  async setCurrentFlight(
    userId: string,
    flightId: string | null,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { currentFlightId: flightId },
    });

    await this.cacheManager.del(cacheByUser(CACHE_KEYS.USER_ME, userId));
  }

  async setLastAirport(userId: string, airportId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastAirportId: airportId, lastAirportUpdatedAt: new Date() },
    });

    await this.cacheManager.del(cacheByUser(CACHE_KEYS.USER_ME, userId));
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
      homeAirportId: user.homeAirportId,
      lastAirportId: user.lastAirportId,
      lastAirportUpdatedAt: user.lastAirportUpdatedAt,
    };
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.user.count({ where: { id } });

    return count > 0;
  }

  async getTravelProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        lastAirportId: true,
        lastAirport: { select: { location: true } },
      },
    });
  }

  async getSimbriefUserId(userId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UserWithGivenIdNotFoundError();
    }

    return user.simbriefUserId;
  }
}
