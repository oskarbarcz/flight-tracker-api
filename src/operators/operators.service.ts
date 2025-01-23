import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOperatorDto } from './dto/create-operator.dto';
import { UpdateOperatorDto } from './dto/update-operator.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Operator } from '@prisma/client';
import { v4 } from 'uuid';

@Injectable()
export class OperatorsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateOperatorDto): Promise<Operator> {
    const operator: Operator | null = await this.findOneBy({
      icaoCode: data.icaoCode,
    });

    if (operator) {
      throw new BadRequestException(
        'Operator with given ICAO code already exists.',
      );
    }

    return this.prisma.operator.create({ data: { id: v4(), ...data } });
  }

  async findAll(): Promise<Operator[]> {
    return this.prisma.operator.findMany();
  }

  async findOne(id: string): Promise<Operator> {
    const aircraft: Operator | null = await this.findOneBy({ id });

    if (!aircraft) {
      throw new NotFoundException('Operator with given id does not exist.');
    }

    return aircraft;
  }

  async update(id: string, data: UpdateOperatorDto): Promise<Operator> {
    const operator: Operator | null = await this.findOneBy({ id });

    if (!operator) {
      throw new NotFoundException('Operator with given id does not exist.');
    }

    return this.prisma.operator.update({
      where: { id },
      data: data,
    });
  }

  async remove(id: string): Promise<void> {
    const aircraft: Operator | null = await this.findOneBy({ id });

    if (!aircraft) {
      throw new NotFoundException('Operator with given id does not exist.');
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
