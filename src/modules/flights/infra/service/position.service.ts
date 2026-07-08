import { Injectable, Logger } from '@nestjs/common';
import { FlightsRepository } from '../database/repository/flights.repository';
import { OnEvent } from '@nestjs/event-emitter';
import { DomainEventEmitter } from '../../../../core/domain/events/domain-event-emitter';
import {
  FlightEventType,
  LivePositionReceivedEvent,
  OnBlockWasReportedEvent,
} from '../../../../core/domain/events/dto/flight.events';
import { AdsbClient } from '../../../../core/provider/adsb/client/adsb.client';
import { FlightEventScope } from '../../model/event.model';
import { Cron, CronExpression } from '@nestjs/schedule';
import { trimCallsign } from '../../model/flight.model';

@Injectable()
export class PositionService {
  private readonly logger = new Logger(PositionService.name);

  constructor(
    private readonly adsbClient: AdsbClient,
    private readonly flightsRepository: FlightsRepository,
    private readonly domainEvents: DomainEventEmitter,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async periodicallyBackupFlightPath(): Promise<void> {
    const flights = await this.flightsRepository.findAllTrackable();

    for (const flight of flights) {
      const callsign = trimCallsign(flight.callsign);
      const track = await this.adsbClient.getTrackHistory(callsign);
      const { isFirstReceipt } = await this.flightsRepository.updateFlightPath(
        flight.id,
        track,
      );

      if (isFirstReceipt) {
        this.emitLivePositionReceived(flight.id);
      }
    }
  }

  @OnEvent(FlightEventType.OnBlockWasReported)
  async storeFlightPathOnFlightEnd(
    event: OnBlockWasReportedEvent,
  ): Promise<void> {
    const flightId = event.payload.flightId;

    try {
      const flight = await this.flightsRepository.getOneById(flightId);
      const callsign = trimCallsign(flight.callsign);

      const track = await this.adsbClient.getTrackHistory(callsign);
      const { isFirstReceipt } = await this.flightsRepository.updateFlightPath(
        flightId,
        track,
      );

      if (isFirstReceipt) {
        this.emitLivePositionReceived(flightId);
      }
    } catch (error) {
      this.logger.warn(
        `Could not back up flight path on on-block for flight ${flightId}: ${error}`,
      );
    }
  }

  private emitLivePositionReceived(flightId: string): void {
    this.domainEvents.emit(
      new LivePositionReceivedEvent({
        flightId,
        rotationId: null,
        scope: FlightEventScope.System,
        actorId: null,
      }),
    );
  }
}
