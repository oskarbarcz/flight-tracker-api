import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FlightEventScope, Prisma } from '@prisma/client';
import { NewFlightEvent } from '../dto/event.dto';
import { OnEvent } from '@nestjs/event-emitter';
import { FlightEventType } from '../../common/events/flight';

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

  @OnEvent(FlightEventType.FlightWasReleased)
  @OnEvent(FlightEventType.PilotCheckedIn)
  @OnEvent(FlightEventType.BoardingWasStarted)
  @OnEvent(FlightEventType.BoardingWasFinished)
  @OnEvent(FlightEventType.OffBlockWasReported)
  @OnEvent(FlightEventType.TakeoffWasReported)
  @OnEvent(FlightEventType.ArrivalWasReported)
  @OnEvent(FlightEventType.OnBlockWasReported)
  @OnEvent(FlightEventType.OffboardingWasStarted)
  @OnEvent(FlightEventType.OffboardingWasFinished)
  @OnEvent(FlightEventType.FlightWasClosed)
  @OnEvent(FlightEventType.FlightTrackWasSaved)
  @OnEvent(FlightEventType.PreliminaryLoadsheetWasUpdated)
  @OnEvent(FlightEventType.ScheduledTimesheetWasUpdated)
  @OnEvent(FlightEventType.FlightWasAddedToRotation)
  @OnEvent(FlightEventType.FlightWasRemovedFromRotation)
  async saveEvent(event: NewFlightEvent): Promise<void> {
    console.log(event);
    await this.prisma.flightEvent.create({ data: event });
  }

  private async flightExists(flightId: string): Promise<boolean> {
    const count = await this.prisma.flight.count({
      where: { id: flightId },
    });
    return count !== 0;
  }
}
