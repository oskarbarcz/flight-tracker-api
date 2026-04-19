import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../core/provider/prisma/prisma.service';
import { Prisma } from 'prisma/client/client';
import {
  CreateTerminalRequest,
  UpdateTerminalRequest,
} from '../http/request/terminal.dto';

const selectTerminal = {
  id: true,
  airportId: true,
  shortName: true,
  fullName: true,
  averageTaxiTime: true,
  operatorCodes: true,
} as const satisfies Prisma.TerminalSelect;

type TerminalView = Prisma.TerminalGetPayload<{
  select: typeof selectTerminal;
}>;

@Injectable()
export class TerminalsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    airportId: string,
    terminalId: string,
    data: CreateTerminalRequest,
  ): Promise<TerminalView> {
    await this.assertAirportExists(airportId);

    return this.prisma.terminal.create({
      data: {
        ...data,
        operatorCodes: data.operatorCodes as Prisma.JsonArray,
        airport: { connect: { id: airportId } },
      },
      select: selectTerminal,
    });
  }

  async findAll(airportId: string): Promise<TerminalView[]> {
    await this.assertAirportExists(airportId);

    return this.prisma.terminal.findMany({
      where: { airportId },
      select: selectTerminal,
      orderBy: { shortName: 'asc' },
    });
  }

  async findOne(airportId: string, id: string): Promise<TerminalView> {
    await this.assertAirportExists(airportId);

    const terminal = await this.prisma.terminal.findFirst({
      where: { id, airportId },
      select: selectTerminal,
    });

    if (!terminal) {
      throw new NotFoundException('Terminal with given id does not exist.');
    }

    return {
      ...terminal,
      operatorCodes: terminal.operatorCodes as string[],
    };
  }

  async update(
    airportId: string,
    id: string,
    data: UpdateTerminalRequest,
  ): Promise<void> {
    await this.findOne(airportId, id);

    await this.prisma.terminal.update({
      where: { id },
      data: {
        ...data,
        operatorCodes:
          data.operatorCodes !== undefined
            ? (data.operatorCodes as Prisma.JsonArray)
            : undefined,
      },
      select: selectTerminal,
    });
  }

  async remove(airportId: string, id: string): Promise<void> {
    await this.findOne(airportId, id);

    await this.prisma.terminal.delete({ where: { id } });
  }

  private async assertAirportExists(airportId: string): Promise<void> {
    const count = await this.prisma.airport.count({
      where: { id: airportId },
    });

    if (count !== 1) {
      throw new NotFoundException('Airport with given id does not exist.');
    }
  }
}
