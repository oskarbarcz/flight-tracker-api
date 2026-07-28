import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { QueryBus } from '@nestjs/cqrs';
import {
  FlightEventType,
  PilotCheckedInEvent,
  OnBlockWasReportedEvent,
} from '../../../../../core/domain/events/dto/flight.events';
import { AircraftRepository } from '../../../infra/database/repository/aircraft.repository';
import { RepositionRepository } from '../../../infra/database/repository/reposition.repository';
import { GetRepositionDataQuery } from '../../../../flights/application/query/reposition/get-reposition-data.query';
import { haversineDistanceNm } from '../../../../../core/utils/distance';
import { AircraftRepositionType, FlightSource } from 'prisma/client/enums';

type Coordinates = { latitude: number; longitude: number };

@Injectable()
export class RepositionFlightLifecycleListener {
  constructor(
    private readonly aircraftRepository: AircraftRepository,
    private readonly repositionRepository: RepositionRepository,
    private readonly queryBus: QueryBus,
  ) {}

  @OnEvent(FlightEventType.PilotCheckedIn)
  async onPilotCheckedIn(event: PilotCheckedInEvent): Promise<void> {
    await this.recordCheckInReposition(
      event.payload.aircraftId,
      event.payload.flightId,
    );
  }

  @OnEvent(FlightEventType.OnBlockWasReported)
  async onOnBlockWasReported(event: OnBlockWasReportedEvent): Promise<void> {
    await this.repositionRepository.finishPerformingFlight(
      event.payload.aircraftId,
      event.payload.flightId,
    );
  }

  private async recordCheckInReposition(
    aircraftId: string,
    flightId: string,
  ): Promise<void> {
    const aircraft =
      await this.aircraftRepository.getRepositionOrigin(aircraftId);

    const repositionDataQuery = new GetRepositionDataQuery(flightId);
    const flight = await this.queryBus.execute(repositionDataQuery);

    if (!aircraft || !flight) {
      return;
    }

    const { source, greatCircleDistance, departure, destination } = flight;
    const departureAirportId = departure.id;

    if (
      aircraft.lastAirportId &&
      aircraft.lastAirportId !== departureAirportId
    ) {
      const distance = haversineDistanceNm(
        aircraft.lastAirport!.location as unknown as Coordinates,
        departure.location,
      );
      await this.repositionRepository.createDeadhead(
        AircraftRepositionType.dead_head_automatic,
        aircraftId,
        aircraft.lastAirportId,
        departureAirportId,
        distance,
        flightId,
      );
    } else if (!aircraft.lastAirportId) {
      await this.aircraftRepository.updateLastLocation(
        aircraftId,
        departureAirportId,
        null,
        new Date(),
      );
    }

    const performingDistance =
      source === FlightSource.simbrief
        ? greatCircleDistance
        : haversineDistanceNm(departure.location, destination.location);

    await this.repositionRepository.createPerformingFlight(
      aircraftId,
      flightId,
      departureAirportId,
      destination.id,
      performingDistance,
    );
  }
}
