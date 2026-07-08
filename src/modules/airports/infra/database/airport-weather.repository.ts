import { Injectable } from '@nestjs/common';
import { Prisma } from 'prisma/client/client';
import { PrismaService } from '../../../../core/provider/prisma/prisma.service';
import { FlightStatus } from '../../../flights/model/flight.model';

const selectWeather = {
  metar: true,
  metarLastUpdate: true,
  taf: true,
  tafLastUpdate: true,
  watch: true,
} as const satisfies Prisma.AirportWeatherSelect;

export type AirportWeatherView = Prisma.AirportWeatherGetPayload<{
  select: typeof selectWeather;
}>;

export type WeatherAirport = { airportId: string; icaoCode: string };

export type WeatherUpdate = {
  metar?: string;
  metarLastUpdate?: Date;
  taf?: string;
  tafLastUpdate?: Date;
};

const ACTIVE_FLIGHT_STATUSES: FlightStatus[] = [
  FlightStatus.CheckedIn,
  FlightStatus.BoardingStarted,
  FlightStatus.BoardingFinished,
  FlightStatus.TaxiingOut,
  FlightStatus.InCruise,
  FlightStatus.TaxiingIn,
];

@Injectable()
export class AirportWeatherRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getByAirportId(airportId: string): Promise<AirportWeatherView | null> {
    return this.prisma.airportWeather.findUnique({
      where: { airportId },
      select: selectWeather,
    });
  }

  async watchAirports(airportIds: string[]): Promise<void> {
    await this.prisma.$transaction(
      airportIds.map((airportId) =>
        this.prisma.airportWeather.upsert({
          where: { airportId },
          create: { airportId, watch: true },
          update: { watch: true },
        }),
      ),
    );
  }

  async unwatchFlightAirports(flightId: string): Promise<void> {
    const airportIds = await this.getFlightAirportIds(flightId);
    if (airportIds.length === 0) {
      return;
    }

    const stillWatched = await this.prisma.airportsOnFlights.findMany({
      where: {
        airportId: { in: airportIds },
        flightId: { not: flightId },
        flight: { status: { in: ACTIVE_FLIGHT_STATUSES } },
      },
      select: { airportId: true },
    });

    const keep = new Set(stillWatched.map((row) => row.airportId));
    const toUnwatch = airportIds.filter((id) => !keep.has(id));

    await this.prisma.airportWeather.updateMany({
      where: { airportId: { in: toUnwatch } },
      data: { watch: false },
    });
  }

  async listWatched(): Promise<WeatherAirport[]> {
    const rows = await this.prisma.airportWeather.findMany({
      where: { watch: true },
      select: { airportId: true, airport: { select: { icaoCode: true } } },
    });

    return rows.map((row) => ({
      airportId: row.airportId,
      icaoCode: row.airport.icaoCode,
    }));
  }

  async getIcaoCodes(airportIds: string[]): Promise<WeatherAirport[]> {
    const rows = await this.prisma.airport.findMany({
      where: { id: { in: airportIds } },
      select: { id: true, icaoCode: true },
    });

    return rows.map((row) => ({ airportId: row.id, icaoCode: row.icaoCode }));
  }

  async saveWeather(airportId: string, data: WeatherUpdate): Promise<void> {
    await this.prisma.airportWeather.update({ where: { airportId }, data });
  }

  private async getFlightAirportIds(flightId: string): Promise<string[]> {
    const rows = await this.prisma.airportsOnFlights.findMany({
      where: { flightId },
      select: { airportId: true },
    });

    return rows.map((row) => row.airportId);
  }
}
