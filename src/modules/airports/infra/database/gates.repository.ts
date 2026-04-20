import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/provider/prisma/prisma.service';
import { Gate, Prisma } from 'prisma/client/client';
import { CreateGateRequest, UpdateGateRequest } from '../http/request/gate.dto';

const selectGate = {
  id: true,
  airportId: true,
  terminalId: true,
  name: true,
  bridge: true,
  stairs: true,
  deicing: true,
  deicingDescription: true,
  gpu: true,
  pca: true,
  parkingPositionType: true,
  parkingSpotType: true,
  parkingAssistance: true,
  location: true,
  noiseSensitivity: true,
  noiseSensitivityText: true,
  noiseSensitivityStartTime: true,
  noiseSensitivityEndTime: true,
  fuelingOptions: true,
} as const satisfies Prisma.GateSelect;

type GateView = Prisma.GateGetPayload<{
  select: typeof selectGate;
}>;

@Injectable()
export class GatesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    airportId: string,
    gateId: string,
    data: CreateGateRequest,
  ): Promise<GateView> {
    return this.prisma.gate.create({
      data: {
        id: gateId,
        airportId,
        ...data,
      },
      select: selectGate,
    });
  }

  async findAll(airportId: string): Promise<GateView[]> {
    return this.prisma.gate.findMany({
      where: { airportId },
      select: selectGate,
      orderBy: { name: 'asc' },
    });
  }

  async findOneBy(
    criteria: Partial<Record<keyof Gate, any>>,
  ): Promise<GateView | null> {
    return this.prisma.gate.findFirst({
      where: criteria,
      select: selectGate,
    });
  }

  async update(id: string, data: UpdateGateRequest): Promise<void> {
    await this.prisma.gate.update({
      where: { id },
      data: { ...data },
    });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.gate.delete({ where: { id } });
  }

  async exists(airportId: string, id: string): Promise<boolean> {
    return !!(await this.findOneBy({ id, airportId }));
  }
}
