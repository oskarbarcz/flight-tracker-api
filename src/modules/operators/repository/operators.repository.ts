import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/provider/prisma/prisma.service';
import { Operator } from '../entity/operator.entity';
import { CreateOperatorDto } from '../dto/create-operator.dto';
import { UpdateOperatorDto } from '../dto/update-operator.dto';

@Injectable()
export class OperatorsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(id: string, data: CreateOperatorDto): Promise<Operator> {
    return this.prisma.operator.create({ data: { id, ...data } });
  }

  async findAll(): Promise<Operator[]> {
    return this.prisma.operator.findMany();
  }

  async findOneBy(
    criteria: Partial<Record<keyof Operator, any>>,
  ): Promise<Operator | null> {
    return this.prisma.operator.findFirst({
      where: criteria,
    });
  }

  async update(id: string, data: UpdateOperatorDto): Promise<Operator> {
    return this.prisma.operator.update({
      where: { id },
      data: data,
    });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.operator.delete({ where: { id } });
  }

  async exists(operatorId: string): Promise<boolean> {
    return !!(await this.findOneBy({ id: operatorId }));
  }

  async countFlights(operatorId: string): Promise<number> {
    return this.prisma.flight.count({
      where: { operatorId },
    });
  }

  async countAircraft(operatorId: string): Promise<number> {
    return this.prisma.aircraft.count({
      where: { operatorId },
    });
  }
}
