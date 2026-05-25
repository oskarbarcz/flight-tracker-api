import { Injectable } from '@nestjs/common';
import { FlightsRepository } from '../database/repository/flights.repository';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { FlightEventType } from '../../../../core/events/flight';
import { AdsbClient } from '../../../../core/provider/adsb/client/adsb.client';
import { FlightEvent, FlightEventScope } from '../../model/event.model';
import { Cron, CronExpression } from '@nestjs/schedule';
import { trimCallsign } from '../../model/flight.model';
import { NewFlightEvent } from '../http/request/event.dto';

@Injectable()
export class PositionService {
  constructor(
    private readonly adsbClient: AdsbClient,
    private readonly flightsRepository: FlightsRepository,
    private readonly eventEmitter: EventEmitter2,
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
  async storeFlightPathOnFlightEnd(event: FlightEvent): Promise<void> {
    const flight = await this.flightsRepository.getOneById(event.flightId);
    const callsign = trimCallsign(flight.callsign);

    const track = await this.adsbClient.getTrackHistory(callsign);
    const { isFirstReceipt } = await this.flightsRepository.updateFlightPath(
      event.flightId,
      track,
    );

    if (isFirstReceipt) {
      this.emitLivePositionReceived(event.flightId);
    }
  }

  private emitLivePositionReceived(flightId: string): void {
    const event: NewFlightEvent = {
      flightId,
      rotationId: null,
      type: FlightEventType.LivePositionReceived,
      scope: FlightEventScope.System,
      actorId: null,
    };
    this.eventEmitter.emit(FlightEventType.LivePositionReceived, event);
  }
}
