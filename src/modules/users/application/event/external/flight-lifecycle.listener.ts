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
import { UserTravelRepository } from '../../../infra/database/repository/user-travel.repository';
import {
  FilledSchedule,
  FilledTimesheet,
} from '../../../../flights/model/timesheet.model';
import { scheduleToBlockTimeInMinutes } from '../../../../flights/infra/helper/dates';
import { AirportType } from '../../../../airports/model/airport.model';
import { haversineDistanceNm } from '../../../../../core/utils/distance';
import {
  FlightSource,
  UserRole,
  UserTravelType,
} from '../../../../../../prisma/client/enums';

type Coordinates = { latitude: number; longitude: number };

@Injectable()
export class FlightLifecycleListener {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly travelRepository: UserTravelRepository,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent(FlightEventType.PilotCheckedIn)
  async onPilotCheckedIn(event: PilotCheckedInEvent): Promise<void> {
    const userId = event.payload.actorId as string;

    await this.usersRepository.setCurrentFlight(userId, event.payload.flightId);

    await this.recordCheckInTravel(userId, event.payload.flightId);

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

    await this.travelRepository.finishPerformingFlight(
      flight.captainId as string,
      event.payload.flightId,
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

  private async recordCheckInTravel(
    userId: string,
    flightId: string,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        lastAirportId: true,
        lastAirport: { select: { location: true } },
      },
    });

    // travel is only tracked for cabin crew
    if (!user || user.role !== UserRole.CabinCrew) {
      return;
    }

    const flight = await this.prisma.flight.findUnique({
      where: { id: flightId },
      select: {
        source: true,
        greatCircleDistance: true,
        airports: {
          select: {
            airportType: true,
            airport: { select: { id: true, location: true } },
          },
        },
      },
    });

    const departure = flight?.airports.find(
      (a) => a.airportType === AirportType.Departure,
    );
    const destination = flight?.airports.find(
      (a) => a.airportType === AirportType.Destination,
    );

    if (!flight || !departure || !destination) {
      return;
    }

    const departureAirportId = departure.airport.id;

    if (user.lastAirportId && user.lastAirportId !== departureAirportId) {
      // user repositions from their current airport to the departure airport
      const distance = haversineDistanceNm(
        user.lastAirport!.location as unknown as Coordinates,
        departure.airport.location as unknown as Coordinates,
      );
      await this.travelRepository.createDeadhead(
        UserTravelType.dead_head_automatic,
        userId,
        user.lastAirportId,
        departureAirportId,
        distance,
        flightId,
      );
    } else if (!user.lastAirportId) {
      // no known origin: just place the user at the departure airport
      await this.usersRepository.setLastAirport(userId, departureAirportId);
    }

    const performingDistance =
      flight.source === FlightSource.simbrief
        ? flight.greatCircleDistance
        : haversineDistanceNm(
            departure.airport.location as unknown as Coordinates,
            destination.airport.location as unknown as Coordinates,
          );

    await this.travelRepository.createPerformingFlight(
      userId,
      flightId,
      departureAirportId,
      destination.airport.id,
      performingDistance,
    );
  }
}
