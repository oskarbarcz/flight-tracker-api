import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { QueryBus } from '@nestjs/cqrs';
import {
  FlightEventType,
  PilotCheckedInEvent,
  OnBlockWasReportedEvent,
  FlightWasClosedEvent,
} from '../../../../../core/domain/events/dto/flight.events';
import { UsersRepository } from '../../../infra/database/repository/users.repository';
import { UserTravelRepository } from '../../../infra/database/repository/user-travel.repository';
import { haversineDistanceNm } from '../../../../../core/utils/distance';
import { FlightSource, UserTravelType } from 'prisma/client/enums';
import { UserRole } from '../../../model/user-role';
import { GetFlightCompletionStatsQuery } from '../../../../flights/application/query/get-flight-completion-stats.query';
import { GetRepositionDataQuery } from '../../../../flights/application/query/reposition/get-reposition-data.query';

type Coordinates = { latitude: number; longitude: number };

@Injectable()
export class FlightLifecycleListener {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly travelRepository: UserTravelRepository,
    private readonly queryBus: QueryBus,
  ) {}

  @OnEvent(FlightEventType.PilotCheckedIn)
  async onPilotCheckedIn(event: PilotCheckedInEvent): Promise<void> {
    const userId = event.payload.actorId as string;

    await this.usersRepository.setCurrentFlight(userId, event.payload.flightId);

    await this.recordCheckInTravel(userId, event.payload.flightId);
  }

  @OnEvent(FlightEventType.OnBlockWasReported)
  async onOnBlockWasReported(event: OnBlockWasReportedEvent): Promise<void> {
    const completionStatsQuery = new GetFlightCompletionStatsQuery(
      event.payload.flightId,
    );
    const flight = await this.queryBus.execute(completionStatsQuery);
    const captainId = flight.captainId as string;

    await this.usersRepository.setLastAirport(
      captainId,
      event.payload.landingAirportId,
    );

    await this.travelRepository.finishPerformingFlight(
      captainId,
      event.payload.flightId,
    );
  }

  @OnEvent(FlightEventType.FlightWasClosed)
  async onFlightWasClosed(event: FlightWasClosedEvent): Promise<void> {
    const userId = event.payload.actorId as string;

    await this.usersRepository.setCurrentFlight(userId, null);
  }

  private async recordCheckInTravel(
    userId: string,
    flightId: string,
  ): Promise<void> {
    const user = await this.usersRepository.getTravelProfile(userId);

    if (!user || user.role !== UserRole.CabinCrew) {
      return;
    }

    const repositionDataQuery = new GetRepositionDataQuery(flightId);
    const flight = await this.queryBus.execute(repositionDataQuery);

    if (!flight) {
      return;
    }

    const { source, greatCircleDistance, departure, destination } = flight;
    const departureAirportId = departure.id;

    if (user.lastAirportId && user.lastAirportId !== departureAirportId) {
      const distance = haversineDistanceNm(
        user.lastAirport!.location as unknown as Coordinates,
        departure.location,
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
      await this.usersRepository.setLastAirport(userId, departureAirportId);
    }

    const performingDistance =
      source === FlightSource.simbrief
        ? greatCircleDistance
        : haversineDistanceNm(departure.location, destination.location);

    await this.travelRepository.createPerformingFlight(
      userId,
      flightId,
      departureAirportId,
      destination.id,
      performingDistance,
    );
  }
}
