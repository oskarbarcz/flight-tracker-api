import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/provider/prisma/prisma.service';
import {
  HarvestedWaypoint,
  WaypointKind,
  WaypointResponse,
} from '../../model/waypoint.model';

@Injectable()
export class WaypointsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async record(waypoints: HarvestedWaypoint[]): Promise<void> {
    for (const waypoint of waypoints) {
      const existing = await this.prisma.waypoint.findFirst({
        where: { ident: waypoint.ident, icaoRegion: waypoint.icaoRegion },
        select: { id: true },
      });

      const data = {
        kind: waypoint.kind,
        posLat: waypoint.latitude,
        posLong: waypoint.longitude,
        frequency: waypoint.frequency,
        lastSeenAt: new Date(),
      };

      if (existing) {
        await this.prisma.waypoint.update({ where: { id: existing.id }, data });
        continue;
      }

      await this.prisma.waypoint.create({
        data: {
          ident: waypoint.ident,
          icaoRegion: waypoint.icaoRegion,
          ...data,
        },
      });
    }
  }

  async findByIdent(ident: string): Promise<WaypointResponse[]> {
    const rows = await this.prisma.waypoint.findMany({
      where: { ident: ident.toUpperCase() },
      orderBy: [{ icaoRegion: 'asc' }, { ident: 'asc' }],
    });

    return rows.map((row) => ({
      id: row.id,
      ident: row.ident,
      icaoRegion: row.icaoRegion,
      kind: row.kind as WaypointKind,
      location: {
        latitude: Number(row.posLat),
        longitude: Number(row.posLong),
      },
      frequency: row.frequency === null ? null : Number(row.frequency),
      lastSeenAt: row.lastSeenAt,
    }));
  }
}
