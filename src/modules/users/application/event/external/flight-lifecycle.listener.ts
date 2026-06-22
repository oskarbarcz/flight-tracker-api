import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  FlightEventType,
  PilotCheckedInEvent,
  OnBlockWasReportedEvent,
  FlightWasClosedEvent,
} from '../../../../../core/domain/events/dto/flight.events';
import { PrismaService } from '../../../../../core/provider/prisma/prisma.service';
import { UsersRepository } from '../../../infra/database/repository/users.repository';
import {
  FilledSchedule,
  FilledTimesheet,
} from '../../../../flights/model/timesheet.model';
import { scheduleToBlockTimeInMinutes } from '../../../../flights/infra/helper/dates';

@Injectable()
export class FlightLifecycleListener {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent(FlightEventType.PilotCheckedIn)
  async onPilotCheckedIn(event: PilotCheckedInEvent): Promise<void> {
    const userId = event.payload.actorId as string;

    await this.usersRepository.setCurrentFlight(userId, event.payload.flightId);

    if (!event.payload.rotationId) {
      return;
    }

    await this.usersRepository.setCurrentRotation(
      userId,
      event.payload.rotationId,
    );
  }

  @OnEvent(FlightEventType.OnBlockWasReported)
  async onOnBlockWasReported(event: OnBlockWasReportedEvent): Promise<void> {
    const flight = await this.prisma.flight.findFirstOrThrow({
      select: {
        captainId: true,
        greatCircleDistance: true,
        totalFuelBurned: true,
        timesheet: true,
      },
      where: { id: event.payload.flightId },
    });

    const timesheet = flight.timesheet as FilledTimesheet;
    const blockTime = scheduleToBlockTimeInMinutes(
      timesheet.actual as FilledSchedule,
    );

    await this.usersRepository.addCompletedFlightStats(
      flight.captainId as string,
      {
        greatCircleDistance: flight.greatCircleDistance,
        totalFuelBurned: flight.totalFuelBurned,
        blockTime,
      },
      event.payload.landingAirportId,
      new Date(),
    );
  }

  @OnEvent(FlightEventType.FlightWasClosed)
  async onFlightWasClosed(event: FlightWasClosedEvent): Promise<void> {
    const userId = event.payload.actorId as string;

    await this.usersRepository.setCurrentFlight(userId, null);

    // flight has no rotation
    if (!event.payload.rotationId) {
      return;
    }

    const lastFlightInRotation = await this.prisma.flight.findFirst({
      select: { id: true },
      where: { rotationId: event.payload.rotationId },
      orderBy: { createdAt: 'desc' },
    });

    // flight is not last in rotation
    if (lastFlightInRotation?.id !== event.payload.flightId) {
      return;
    }

    await this.usersRepository.setCurrentRotation(userId, null);
  }
}
