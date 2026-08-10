import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/provider/prisma/prisma.service';
import { Airport, Prisma } from 'prisma/client/client';
import {
  AirportIcaoAlreadyExistsError,
  AirportInUseError,
  AirportNotFoundError,
} from '../../model/error/airport.error';
import {
  AirportListFilters,
  CreateAirportRequest,
  UpdateAirportResponse,
} from '../http/request/airport.dto';
import { FlightStatus } from '../../../flights/model/flight.model';

export type WeatherAirport = { airportId: string; icaoCode: string };

const ACTIVE_FLIGHT_STATUSES: FlightStatus[] = [
  FlightStatus.CheckedIn,
  FlightStatus.BoardingStarted,
  FlightStatus.BoardingFinished,
  FlightStatus.TaxiingOut,
  FlightStatus.InCruise,
  FlightStatus.TaxiingIn,
];

const selectAirport = {
  id: true,
  icaoCode: true,
  iataCode: true,
  city: true,
  name: true,
  country: true,
  timezone: true,
  location: true,
  continent: true,
  dataQuality: true,
  shape: true,
} as const satisfies Prisma.AirportSelect;

type AirportView = Prisma.AirportGetPayload<{
  select: typeof selectAirport;
}>;

@Injectable()
export class AirportsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    airportId: string,
    data: CreateAirportRequest,
  ): Promise<AirportView> {
    const airport = await this.findOneBy({ icaoCode: data.icaoCode });

    if (airport) {
      throw new AirportIcaoAlreadyExistsError();
    }

    return this.prisma.airport.create({
      data: {
        id: airportId,
        ...data,
        location: data.location as unknown as Prisma.JsonObject,
        shape:
          data.shape == null
            ? Prisma.DbNull
            : (data.shape as unknown as Prisma.InputJsonValue),
      },
      select: selectAirport,
    });
  }

  async findAll(filters: AirportListFilters): Promise<AirportView[]> {
    return this.prisma.airport.findMany({
      where: {
        continent: filters.continent,
        dataQuality: filters.dataQuality,
      },
      select: selectAirport,
    });
  }

  async findById(id: string): Promise<AirportView> {
    const airport = await this.findOneBy({ id });

    if (!airport) {
      throw new AirportNotFoundError();
    }

    return airport;
  }

  async update(id: string, data: UpdateAirportResponse): Promise<AirportView> {
    const airport = await this.findOneBy({ id });

    if (!airport) {
      throw new AirportNotFoundError();
    }

    return this.prisma.airport.update({
      where: { id },
      data: {
        ...data,
        location: data.location as unknown as Prisma.JsonObject,
        shape:
          data.shape === undefined
            ? undefined
            : data.shape === null
              ? Prisma.DbNull
              : (data.shape as unknown as Prisma.InputJsonValue),
      },
      select: selectAirport,
    });
  }

  async remove(id: string): Promise<void> {
    const airport = await this.findOneBy({ id });

    if (!airport) {
      throw new AirportNotFoundError();
    }

    const connectedAirports = await this.prisma.airportsOnFlights.count({
      where: { airportId: id },
    });

    if (connectedAirports > 0) {
      throw new AirportInUseError();
    }

    await this.prisma.airport.delete({ where: { id } });
  }

  public async findOneBy(
    criteria: Partial<Record<keyof Airport, any>>,
  ): Promise<AirportView | null> {
    return this.prisma.airport.findFirst({
      where: criteria,
      select: selectAirport,
    });
  }

  async exists(airportId: string): Promise<boolean> {
    const count = await this.prisma.airport.count({
      where: { id: airportId },
    });

    return count > 0;
  }

  async findIdsByIcaoCodes(icaoCodes: string[]): Promise<Map<string, string>> {
    if (icaoCodes.length === 0) {
      return new Map();
    }

    const airports = await this.prisma.airport.findMany({
      where: { icaoCode: { in: icaoCodes } },
      select: { id: true, icaoCode: true },
    });

    return new Map(airports.map((airport) => [airport.icaoCode, airport.id]));
  }

  async listMonitored(): Promise<WeatherAirport[]> {
    const airports = await this.prisma.airport.findMany({
      where: { monitorWeather: true },
      select: { id: true, icaoCode: true },
    });

    return airports.map((airport) => ({
      airportId: airport.id,
      icaoCode: airport.icaoCode,
    }));
  }

  async getIcaoCodes(airportIds: string[]): Promise<WeatherAirport[]> {
    const airports = await this.prisma.airport.findMany({
      where: { id: { in: airportIds } },
      select: { id: true, icaoCode: true },
    });

    return airports.map((airport) => ({
      airportId: airport.id,
      icaoCode: airport.icaoCode,
    }));
  }

  async startMonitoring(airportIds: string[]): Promise<void> {
    await this.prisma.airport.updateMany({
      where: { id: { in: airportIds } },
      data: { monitorWeather: true },
    });
  }

  async stopMonitoring(airportIds: string[]): Promise<void> {
    if (airportIds.length === 0) {
      return;
    }

    const stillReferenced = await this.prisma.airportsOnFlights.findMany({
      where: {
        airportId: { in: airportIds },
        flight: { status: { in: ACTIVE_FLIGHT_STATUSES } },
      },
      select: { airportId: true },
    });

    const keep = new Set(stillReferenced.map((row) => row.airportId));
    const toStop = airportIds.filter((id) => !keep.has(id));

    await this.prisma.airport.updateMany({
      where: { id: { in: toStop } },
      data: { monitorWeather: false },
    });
  }
}
