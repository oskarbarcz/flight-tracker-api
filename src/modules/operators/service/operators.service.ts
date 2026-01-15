import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOperatorDto } from '../dto/create-operator.dto';
import { UpdateOperatorDto } from '../dto/update-operator.dto';
import { PrismaService } from '../../../core/provider/prisma/prisma.service';
import { v4 } from 'uuid';
import {
  OperatorAlreadyExistsError,
  OperatorContainsAircraftError,
  OperatorContainsFlightsError,
  OperatorDoesNotExistsError,
} from '../dto/errors';
import { Operator } from '../entity/operator.entity';

@Injectable()
export class OperatorsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateOperatorDto): Promise<Operator> {
    const operator: Operator | null = await this.findOneBy({
      icaoCode: data.icaoCode,
    });

    if (operator) {
      throw new BadRequestException(OperatorAlreadyExistsError);
    }

    return this.prisma.operator.create({ data: { id: v4(), ...data } });
  }

  async findAll(): Promise<Operator[]> {
    return this.prisma.operator.findMany();
  }

  async findOne(id: string): Promise<Operator> {
    const aircraft: Operator | null = await this.findOneBy({ id });

    if (!aircraft) {
      throw new NotFoundException(OperatorDoesNotExistsError);
    }

    return aircraft;
  }

  async update(id: string, data: UpdateOperatorDto): Promise<Operator> {
    const operator: Operator | null = await this.findOneBy({ id });

    if (!operator) {
      throw new NotFoundException(OperatorDoesNotExistsError);
    }

    return this.prisma.operator.update({
      where: { id },
      data: data,
    });
  }

  async remove(id: string): Promise<void> {
    const operator = await this.findOneBy({ id });

    if (!operator) {
      throw new NotFoundException(OperatorDoesNotExistsError);
    }

    const flights = await this.prisma.flight.findMany({
      where: { operatorId: id },
    });

    if (flights.length !== 0) {
      throw new BadRequestException(OperatorContainsFlightsError);
    }

    const aircrafts = await this.prisma.aircraft.findMany({
      where: { operatorId: id },
    });

    if (aircrafts.length !== 0) {
      throw new BadRequestException(OperatorContainsAircraftError);
    }

    await this.prisma.operator.delete({ where: { id } });
  }

  private async findOneBy(
    criteria: Partial<Record<keyof Operator, any>>,
  ): Promise<Operator | null> {
    return this.prisma.operator.findFirst({
      where: criteria,
    });
  }

  async exists(operatorId: string): Promise<boolean> {
    return !!(await this.findOneBy({ id: operatorId }));
  }
}
