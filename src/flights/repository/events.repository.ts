import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FlightEventScope, Prisma } from '@prisma/client';

const flightEventWithActor = {
  id: true,
  scope: true,
  type: true,
  payload: true,
  flightId: true,
  actor: {
    select: {
      id: true,
      name: true,
    },
  },
  createdAt: true,
} as const;

type FlightEventWithActor = Prisma.FlightEventGetPayload<{
  select: typeof flightEventWithActor;
}>;

@Injectable()
export class EventsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findForFlight(flightId: string): Promise<FlightEventWithActor[]> {
    if (!(await this.flightExists(flightId))) {
      throw new NotFoundException(`Flight with given ID does not exist.`);
    }

    return this.prisma.flightEvent.findMany({
      select: flightEventWithActor,
      where: {
        flightId,
        scope: { in: [FlightEventScope.user, FlightEventScope.operations] },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async flightExists(flightId: string): Promise<boolean> {
    const count = await this.prisma.flight.count({
      where: { id: flightId },
    });
    return count !== 0;
  }
}
