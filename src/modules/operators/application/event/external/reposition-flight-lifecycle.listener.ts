import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  FlightEventType,
  PilotCheckedInEvent,
  OnBlockWasReportedEvent,
} from '../../../../../core/domain/events/dto/flight.events';
import { PrismaService } from '../../../../../core/provider/prisma/prisma.service';
import { AircraftRepository } from '../../../infra/database/repository/aircraft.repository';
import { RepositionRepository } from '../../../infra/database/repository/reposition.repository';
import { AirportType } from '../../../../airports/model/airport.model';
import { haversineDistanceNm } from '../../../../../core/utils/distance';
import { AircraftRepositionType, FlightSource } from 'prisma/client/enums';

type Coordinates = { latitude: number; longitude: number };

@Injectable()
export class RepositionFlightLifecycleListener {
  constructor(
    private readonly aircraftRepository: AircraftRepository,
    private readonly repositionRepository: RepositionRepository,
    private readonly prisma: PrismaService,
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
    const aircraft = await this.prisma.aircraft.findUnique({
      where: { id: aircraftId },
      select: {
        lastAirportId: true,
        lastAirport: { select: { location: true } },
      },
    });

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

    if (!aircraft || !flight || !departure || !destination) {
      return;
    }

    const departureAirportId = departure.airport.id;

    if (
      aircraft.lastAirportId &&
      aircraft.lastAirportId !== departureAirportId
    ) {
      // aircraft repositions from its current airport to the departure airport
      const distance = haversineDistanceNm(
        aircraft.lastAirport!.location as unknown as Coordinates,
        departure.airport.location as unknown as Coordinates,
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
      // no known origin: just place the aircraft at the departure airport
      await this.aircraftRepository.updateLastLocation(
        aircraftId,
        departureAirportId,
        null,
        new Date(),
      );
    }

    const performingDistance =
      flight.source === FlightSource.simbrief
        ? flight.greatCircleDistance
        : haversineDistanceNm(
            departure.airport.location as unknown as Coordinates,
            destination.airport.location as unknown as Coordinates,
          );

    await this.repositionRepository.createPerformingFlight(
      aircraftId,
      flightId,
      departureAirportId,
      destination.airport.id,
      performingDistance,
    );
  }
}
