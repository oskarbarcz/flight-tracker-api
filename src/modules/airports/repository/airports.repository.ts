import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../core/provider/prisma/prisma.service';
import { Airport, Prisma } from '@prisma/client';
import { AirportInUseError } from '../dto/errors.dto';
import {
  AirportListFilters,
  CreateAirportRequest,
  UpdateAirportResponse,
} from '../dto/airport.dto';

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
} as const satisfies Prisma.AirportSelect;

type AirportView = Prisma.AirportGetPayload<{
  select: typeof selectAirport;
}>;

@Injectable()
export class AirportsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateAirportRequest): Promise<AirportView> {
    const airport = await this.findOneBy({ icaoCode: data.icaoCode });

    if (airport) {
      throw new BadRequestException(
        'Aircraft with given ICAO code already exists.',
      );
    }

    return this.prisma.airport.create({
      data: {
        ...data,
        location: data.location as unknown as Prisma.JsonObject,
      },
      select: selectAirport,
    });
  }

  async findAll(filters: AirportListFilters): Promise<AirportView[]> {
    return this.prisma.airport.findMany({
      where: {
        continent: filters.continent,
      },
      select: selectAirport,
    });
  }

  async findOne(id: string): Promise<AirportView> {
    const airport = await this.findOneBy({ id });

    if (!airport) {
      throw new NotFoundException('Airport with given id does not exist.');
    }

    return airport;
  }

  async update(id: string, data: UpdateAirportResponse): Promise<AirportView> {
    const airport = await this.findOneBy({ id });

    if (!airport) {
      throw new NotFoundException('Airport with given id does not exist.');
    }

    return this.prisma.airport.update({
      where: { id },
      data: {
        ...data,
        location: data.location as unknown as Prisma.JsonObject,
      },
      select: selectAirport,
    });
  }

  async remove(id: string): Promise<void> {
    const airport = await this.findOneBy({ id });

    if (!airport) {
      throw new NotFoundException('Airport with given id does not exist.');
    }

    const connectedAirports = await this.prisma.airportsOnFlights.count({
      where: { airportId: id },
    });

    if (connectedAirports > 0) {
      throw new BadRequestException(AirportInUseError);
    }

    await this.prisma.airport.delete({ where: { id } });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.airport.count({
      where: { id },
    });

    return count === 1;
  }

  private async findOneBy(
    criteria: Partial<Record<keyof Airport, any>>,
  ): Promise<AirportView | null> {
    return this.prisma.airport.findFirst({
      where: criteria,
      select: selectAirport,
    });
  }
}
