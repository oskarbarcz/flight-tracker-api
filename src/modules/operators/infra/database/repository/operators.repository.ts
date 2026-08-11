import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/provider/prisma/prisma.service';
import {
  Operator,
  OperatorAlliance,
  OperatorGroup,
  OperatorServiceType,
  OperatorType,
  serviceTypesCarrying,
} from '../../../model/operator.model';
import { Prisma, Operator as PrismaOperator } from 'prisma/client/client';
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

  async findAll(serviceType?: OperatorServiceType): Promise<Operator[]> {
    const operators = await this.prisma.operator.findMany({
      where: this.carryingFilter(serviceType),
    });

    return operators.map((operator) => this.toDomain(operator));
  }

  async findRecentlyInvolvedWith(
    userId: string,
    limit: number,
    serviceType?: OperatorServiceType,
  ): Promise<Operator[]> {
    const ranking = await this.prisma.flight.groupBy({
      by: ['operatorId'],
      where: {
        OR: [{ captainId: userId }, { createdById: userId }],
        ...(serviceType
          ? { operator: this.carryingFilter(serviceType) }
          : undefined),
      },
      _max: { createdAt: true },
      orderBy: [{ _max: { createdAt: 'desc' } }, { operatorId: 'asc' }],
      take: limit,
    });

    if (ranking.length === 0) {
      return [];
    }

    const lastInvolvedAt = new Map(
      ranking.map((entry) => [
        entry.operatorId,
        (entry._max.createdAt as Date).getTime(),
      ]),
    );

    const operators = await this.prisma.operator.findMany({
      where: { id: { in: [...lastInvolvedAt.keys()] } },
    });

    return operators
      .sort((left, right) => {
        const byRecency =
          (lastInvolvedAt.get(right.id) as number) -
          (lastInvolvedAt.get(left.id) as number);

        return byRecency !== 0
          ? byRecency
          : left.icaoCode.localeCompare(right.icaoCode);
      })
      .map((operator) => this.toDomain(operator));
  }

  async findOneBy(
    criteria: Partial<Record<keyof Operator, any>>,
  ): Promise<Operator | null> {
    const operator = await this.prisma.operator.findFirst({
      where: criteria,
    });

    if (!operator) return null;

    return this.toDomain(operator);
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

  async updateFleet(
    operatorId: string,
    fleetSize: number,
    fleetTypes: string[],
  ): Promise<void> {
    await this.prisma.operator.update({
      where: { id: operatorId },
      data: { fleetSize, fleetTypes },
    });
  }

  private carryingFilter(
    serviceType?: OperatorServiceType,
  ): Prisma.OperatorWhereInput | undefined {
    if (!serviceType) return undefined;

    return { serviceType: { in: serviceTypesCarrying(serviceType) } };
  }

  private toDomain(operator: PrismaOperator): Operator {
    return {
      ...operator,
      type: operator.type as OperatorType,
      serviceType: operator.serviceType as OperatorServiceType,
      continent: operator.continent as Continent,
      alliance: operator.alliance as OperatorAlliance | null,
      group: operator.group as OperatorGroup | null,
      fleetTypes: operator.fleetTypes as string[],
      hubs: operator.hubs as string[],
    };
  }
}
