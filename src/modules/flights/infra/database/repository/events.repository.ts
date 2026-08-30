import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/provider/prisma/prisma.service';
import { FlightWithIdDoesNotExistError } from '../../../model/error/flight.error';
import { FlightLifecycleEvent } from '../../../../../core/domain/events/dto/flight.events';
import { FlightEventScope, Prisma } from 'prisma/client/client';

const flightEventWithActor = {
  id: true,
  scope: true,
  type: true,
  payload: true,
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
      throw new FlightWithIdDoesNotExistError();
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

  async create(event: FlightLifecycleEvent): Promise<FlightEventWithActor> {
    return this.prisma.flightEvent.create({
      select: flightEventWithActor,
      data: {
        flightId: event.payload.flightId,
        scope: event.payload.scope,
        type: event.type,
        payload: event.payload.payload,
        actorId: event.payload.actorId,
      },
    });
  }

  private async flightExists(flightId: string): Promise<boolean> {
    const count = await this.prisma.flight.count({
      where: { id: flightId },
    });
    return count !== 0;
  }
}
