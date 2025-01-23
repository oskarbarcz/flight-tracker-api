import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 } from 'uuid';
import { Aircraft, Prisma } from '@prisma/client';
import {
  AircraftInUseError,
  OperatorForAircraftNotFoundError,
} from './dto/errors.dto';
import { CreateAircraftRequest } from './dto/create-aircraft.dto';
import { UpdateAircraftRequest } from './dto/update-aircraft.dto';
import { OperatorsService } from '../operators/operators.service';

type AircraftWithOperator = Prisma.AircraftGetPayload<{
  select: {
    id: true;
    icaoCode: true;
    shortName: true;
    fullName: true;
    registration: true;
    selcal: true;
    livery: true;
    operator: {
      select: {
        id: true;
        icaoCode: true;
        shortName: true;
        fullName: true;
        callsign: true;
      };
    };
    operatorId: false;
  };
}>;

const aircraftWithOperatorFields = {
  id: true,
  icaoCode: true,
  shortName: true,
  fullName: true,
  registration: true,
  selcal: true,
  livery: true,
  operator: {
    select: {
      id: true,
      icaoCode: true,
      shortName: true,
      fullName: true,
      callsign: true,
    },
  },
  operatorId: false,
};

@Injectable()
export class AircraftService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly operatorService: OperatorsService,
  ) {}

  async create(data: CreateAircraftRequest): Promise<AircraftWithOperator> {
    const aircraft = await this.findOneBy({
      registration: data.registration,
    });

    if (aircraft) {
      throw new BadRequestException(
        'Aircraft with given registration already exists.',
      );
    }

    const operatorExists = await this.operatorService.exists(data.operatorId);

    if (!operatorExists) {
      throw new NotFoundException(OperatorForAircraftNotFoundError);
    }

    return this.prisma.aircraft.create({
      data: { id: v4(), ...data },
      select: aircraftWithOperatorFields,
    });
  }

  async findAll(): Promise<AircraftWithOperator[]> {
    return this.prisma.aircraft.findMany({
      select: aircraftWithOperatorFields,
    });
  }

  async findOne(id: string): Promise<AircraftWithOperator> {
    const aircraft = await this.findOneBy({ id });

    if (!aircraft) {
      throw new NotFoundException('Aircraft with given id does not exist.');
    }

    return aircraft;
  }

  async update(
    id: string,
    data: UpdateAircraftRequest,
  ): Promise<AircraftWithOperator> {
    const aircraft = await this.findOneBy({ id });

    if (!aircraft) {
      throw new NotFoundException('Aircraft with given id does not exist.');
    }

    if (data.operatorId !== undefined) {
      const operatorExists = await this.operatorService.exists(data.operatorId);

      if (!operatorExists) {
        throw new NotFoundException(OperatorForAircraftNotFoundError);
      }
    }

    return this.prisma.aircraft.update({
      where: { id },
      data: data,
      select: aircraftWithOperatorFields,
    });
  }

  async remove(id: string): Promise<void> {
    const aircraft = await this.findOneBy({ id });

    if (!aircraft) {
      throw new NotFoundException('Aircraft with given id does not exist.');
    }

    const connectedFlights = await this.prisma.flight.count({
      where: { aircraftId: id },
    });

    if (connectedFlights > 0) {
      throw new BadRequestException(AircraftInUseError);
    }

    await this.prisma.aircraft.delete({ where: { id } });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.aircraft.count({
      where: { id },
    });

    return count === 1;
  }

  private async findOneBy(
    criteria: Partial<Record<keyof Aircraft, any>>,
  ): Promise<AircraftWithOperator | null> {
    return this.prisma.aircraft.findFirst({
      where: criteria,
      select: aircraftWithOperatorFields,
    });
  }
}
