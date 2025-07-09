import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  FlightEvent as FlightEventEntity,
  FlightEventScope,
  FlightEventType,
} from '../entities/event.entity';

@Injectable()
export class EventsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findForFlight(flightId: string): Promise<FlightEventEntity[]> {
    const events = await this.prisma.flightEvent.findMany({
      where: { flightId },
      orderBy: { createdAt: 'desc' },
    });

    return events.map((event) => {
      return {
        ...event,
        scope: event.scope as FlightEventScope,
        type: event.type as FlightEventType,
        payload: event.payload as object,
      };
    });
  }
}
