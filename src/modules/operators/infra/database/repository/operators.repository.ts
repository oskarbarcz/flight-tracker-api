import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/provider/prisma/prisma.service';
import { Operator, OperatorType } from '../../../model/operator.model';
import { Prisma } from 'prisma/client/client';
import {
  CreateOperatorRequest,
  UpdateOperatorRequest,
} from '../../http/request/operator.request';
import { Continent } from '../../../../airports/model/airport.model';
@Injectable()
export class OperatorsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(id: string, data: CreateOperatorRequest): Promise<void> {
    await this.prisma.operator.create({
      data: {
        id,
        ...data,
        hubs: data.hubs as Prisma.InputJsonValue,
      },
    });
  }

  async findAll(): Promise<Operator[]> {
    const operators = await this.prisma.operator.findMany();

    return operators.map((operator) => ({
      ...operator,
      type: operator.type as OperatorType,
      continent: operator.continent as Continent,
      fleetTypes: operator.fleetTypes as string[],
      hubs: operator.hubs as string[],
    }));
  }

  async findOneBy(
    criteria: Partial<Record<keyof Operator, any>>,
  ): Promise<Operator | null> {
    const operator = await this.prisma.operator.findFirst({
      where: criteria,
    });

    if (!operator) return null;

    return {
      ...operator,
      type: operator.type as OperatorType,
      continent: operator.continent as Continent,
      fleetTypes: operator.fleetTypes as string[],
      hubs: operator.hubs as string[],
    };
  }

  async update(id: string, data: UpdateOperatorRequest): Promise<void> {
    await this.prisma.operator.update({
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
