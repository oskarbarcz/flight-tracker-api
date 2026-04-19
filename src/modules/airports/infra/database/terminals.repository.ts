import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/provider/prisma/prisma.service';
import { Prisma, Terminal } from 'prisma/client/client';
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
  text: true,
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
    return this.prisma.terminal.create({
      data: {
        id: terminalId,
        ...data,
        operatorCodes: data.operatorCodes as Prisma.JsonArray,
        airport: { connect: { id: airportId } },
      },
      select: selectTerminal,
    });
  }

  async findAll(airportId: string): Promise<TerminalView[]> {
    return this.prisma.terminal.findMany({
      where: { airportId },
      select: selectTerminal,
      orderBy: { shortName: 'asc' },
    });
  }

  async findOneBy(
    criteria: Partial<Record<keyof Terminal, any>>,
  ): Promise<TerminalView | null> {
    return this.prisma.terminal.findFirst({
      where: criteria,
      select: selectTerminal,
    });
  }

  async update(id: string, data: UpdateTerminalRequest): Promise<void> {
    await this.prisma.terminal.update({
      where: { id },
      data: {
        ...data,
        operatorCodes:
          data.operatorCodes !== undefined
            ? (data.operatorCodes as Prisma.JsonArray)
            : undefined,
      },
    });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.terminal.delete({ where: { id } });
  }

  async exists(airportId: string, id: string): Promise<boolean> {
    return !!(await this.findOneBy({ id, airportId }));
  }
}
