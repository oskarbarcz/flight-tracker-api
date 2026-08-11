import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../../http/request/create-user.dto';
import { UpdateUserDto } from '../../http/request/update-user.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../../../core/provider/prisma/prisma.service';
import {
  GetUserDto,
  ListUsersFilters,
  OwnUserRecord,
  PilotDto,
} from '../../http/request/get-user.dto';
import { User } from '../../../../../../prisma/client/client';
import { UserRole } from '../../../model/user-role';
import { WeatherSource } from '../../../../airports/model/airport-weather.model';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { CACHE_KEYS, cacheByUser } from '../../../../../core/cache/cache.key';
import { normalizeEmail } from '../../../../../core/utils/email';
import { EmailAlreadyInUseError } from '../../../model/error/user-email.error';
import {
  CabinCrewMustHaveHomeAirportError,
  GoogleAccountLinkedToAnotherUserError,
  OnlyCabinCrewCanHaveHomeAirportError,
  OnlyCabinCrewCanHavePilotLicenseError,
  UserAlreadyHasLinkedGoogleAccountError,
  UserEmailAlreadyExistsError,
  UserNotFoundError,
  UserWithGivenIdNotFoundError,
} from '../../../model/error/user.error';

// Correctness comes from explicit invalidation whenever the underlying user
// changes (profile update, flight completion). The TTL is only a short backstop
// for changes the app can't observe (e.g. an out-of-band DB reset), so it stays
// small to bound staleness rather than acting as the primary cache lifetime.
const PILOT_CARD_TTL_MS = 1000;

function isUniqueConstraintViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { code?: string }).code === 'P2002'
  );
}

@Injectable()
export class UsersRepository {
  BCRYPT_SALT_ROUNDS = 12;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly prisma: PrismaService,
  ) {}

  async create(id: string, data: CreateUserDto): Promise<void> {
    const email = normalizeEmail(data.email);
    const userWithSameEmail = await this.findOneByEmail(email);

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
        email,
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

  async findOwnById(id: string): Promise<OwnUserRecord> {
    const user: User | null = await this.findOneBy({ id });

    if (!user) {
      throw new UserNotFoundError();
    }

    return {
      ...this.returnWithoutPassword(user),
      simbriefUserId: user.simbriefUserId,
      defaultWeatherSource: user.defaultWeatherSource as WeatherSource,
      emailConfirmedAt: user.emailConfirmedAt,
    };
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
    const user = await this.findOneByEmail(email);

    if (!user || user.password === null) {
      return null;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    return !isMatch ? null : this.returnWithoutPassword(user);
  }

  async findByEmail(email: string): Promise<GetUserDto | null> {
    const user = await this.findOneByEmail(email);

    return user === null ? null : this.returnWithoutPassword(user);
  }

  async hasPassword(userId: string): Promise<boolean> {
    const user = await this.findOneBy({ id: userId });

    if (!user) {
      throw new UserNotFoundError();
    }

    return user.password !== null;
  }

  async verifyPassword(userId: string, plain: string): Promise<boolean> {
    const user = await this.findOneBy({ id: userId });

    if (!user || user.password === null) {
      return false;
    }

    return bcrypt.compare(plain, user.password);
  }

  async setPassword(userId: string, plain: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(plain, this.BCRYPT_SALT_ROUNDS);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  async setEmail(userId: string, email: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { email: normalizeEmail(email), emailConfirmedAt: new Date() },
      });
    } catch (error) {
      // Another account can claim the address between the availability check
      // and this write; the unique index is the last word on who gets it.
      if (isUniqueConstraintViolation(error)) {
        throw new EmailAlreadyInUseError();
      }

      throw error;
    }

    await this.cacheManager.del(cacheByUser(CACHE_KEYS.USER_ME, userId));
  }

  async dropOwnUserCache(userId: string): Promise<void> {
    await this.cacheManager.del(cacheByUser(CACHE_KEYS.USER_ME, userId));
  }

  async isEmailTaken(email: string, exceptUserId?: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: {
        email: { equals: normalizeEmail(email), mode: 'insensitive' },
        id: exceptUserId ? { not: exceptUserId } : undefined,
      },
    });

    return count > 0;
  }

  async findByGoogleId(googleId: string): Promise<GetUserDto | null> {
    const user = await this.findOneBy({ googleId });

    return user === null ? null : this.returnWithoutPassword(user);
  }

  async linkGoogleAccount(userId: string, googleId: string): Promise<void> {
    const user = await this.findOneBy({ id: userId });

    if (!user) {
      throw new UserNotFoundError();
    }

    if (user.googleId !== null) {
      throw new UserAlreadyHasLinkedGoogleAccountError();
    }

    const owner = await this.findOneBy({ googleId });

    if (owner !== null && owner.id !== userId) {
      throw new GoogleAccountLinkedToAnotherUserError();
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { googleId },
    });
  }

  async hasLinkedGoogleAccount(userId: string): Promise<boolean> {
    const user = await this.findOneBy({ id: userId });

    if (!user) {
      throw new UserNotFoundError();
    }

    return user.googleId !== null;
  }

  async unlinkGoogleAccount(userId: string): Promise<void> {
    const user = await this.findOneBy({ id: userId });

    if (!user) {
      throw new UserNotFoundError();
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { googleId: null },
    });
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

  private async findOneByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { email: { equals: normalizeEmail(email), mode: 'insensitive' } },
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

  async getDefaultWeatherSource(userId: string): Promise<WeatherSource> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { defaultWeatherSource: true },
    });

    if (!user) {
      throw new UserWithGivenIdNotFoundError();
    }

    return user.defaultWeatherSource as WeatherSource;
  }
}
