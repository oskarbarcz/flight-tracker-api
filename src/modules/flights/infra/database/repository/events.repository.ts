import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/provider/prisma/prisma.service';
import { FlightWithIdDoesNotExistError } from '../../../model/error/flight.error';
import { OnEvent } from '@nestjs/event-emitter';
import {
  FlightEventType,
  FlightLifecycleEvent,
} from '../../../../../core/domain/events/dto/flight.events';
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
  @OnEvent(FlightEventType.LivePositionReceived)
  @OnEvent(FlightEventType.PreliminaryLoadsheetWasUpdated)
  @OnEvent(FlightEventType.ScheduledTimesheetWasUpdated)
  @OnEvent(FlightEventType.PredictedTimesheetWasUpdated)
  @OnEvent(FlightEventType.DepartureParkingPositionWasChanged)
  @OnEvent(FlightEventType.DepartureRunwayWasChanged)
  @OnEvent(FlightEventType.ArrivalParkingPositionWasChanged)
  @OnEvent(FlightEventType.ArrivalRunwayWasChanged)
  @OnEvent(FlightEventType.EmergencyWasDeclared)
  @OnEvent(FlightEventType.EmergencyWasUpdated)
  @OnEvent(FlightEventType.EmergencyWasResolved)
  @OnEvent(FlightEventType.DiversionWasReported)
  @OnEvent(FlightEventType.DiversionWasUpdated)
  @OnEvent(FlightEventType.DelayRequestWasCreated)
  @OnEvent(FlightEventType.DelayReportWasFiled)
  @OnEvent(FlightEventType.DelayReportWasAccepted)
  @OnEvent(FlightEventType.DelayReportWasRejected)
  async saveEvent(event: FlightLifecycleEvent): Promise<void> {
    await this.prisma.flightEvent.create({
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
