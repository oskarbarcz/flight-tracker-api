import { Injectable } from '@nestjs/common';
import { Prisma } from 'prisma/client/client';
import { PrismaService } from '../../../../core/provider/prisma/prisma.service';
import { AirportNotamData } from '../../model/airport-notam.model';

const selectNotam = {
  notamId: true,
  dateCreated: true,
  dateEffective: true,
  dateExpire: true,
  dateModified: true,
  dateImported: true,
  html: true,
  text: true,
  raw: true,
  nrc: true,
  qcode: true,
  qcodeCategory: true,
  qcodeSubject: true,
  qcodeStatus: true,
} as const satisfies Prisma.AirportNotamSelect;

export type AirportNotamView = Prisma.AirportNotamGetPayload<{
  select: typeof selectNotam;
}>;

export type AirportNotamsToStore = {
  airportId: string;
  notams: AirportNotamData[];
};

@Injectable()
export class AirportNotamsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveByAirportId(airportId: string): Promise<AirportNotamView[]> {
    return this.prisma.airportNotam.findMany({
      where: {
        airportId,
        OR: [{ dateExpire: null }, { dateExpire: { gte: new Date() } }],
      },
      orderBy: { dateEffective: 'desc' },
      select: selectNotam,
    });
  }

  async replaceForAirports(entries: AirportNotamsToStore[]): Promise<void> {
    if (entries.length === 0) {
      return;
    }

    const airportIds = entries.map((entry) => entry.airportId);
    const rows: Prisma.AirportNotamCreateManyInput[] = entries.flatMap(
      (entry) =>
        entry.notams.map((notam) => ({ airportId: entry.airportId, ...notam })),
    );

    await this.prisma.$transaction([
      this.prisma.airportNotam.deleteMany({
        where: { airportId: { in: airportIds } },
      }),
      ...(rows.length > 0
        ? [this.prisma.airportNotam.createMany({ data: rows })]
        : []),
    ]);
  }
}
