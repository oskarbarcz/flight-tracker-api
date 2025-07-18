import { Injectable } from '@nestjs/common';
import { FlightsRepository } from '../repository/flights.repository';
import { OnEvent } from '@nestjs/event-emitter';
import { FlightEventType } from '../../../core/events/flight';
import { AdsbClient } from '../../../core/provider/adsb/client/adsb.client';
import { FlightEvent } from '../entity/event.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { trimCallsign } from '../entity/flight.entity';

@Injectable()
export class PositionService {
  constructor(
    private readonly adsbClient: AdsbClient,
    private readonly flightsRepository: FlightsRepository,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async periodicallyBackupFlightPath(): Promise<void> {
    const flights = await this.flightsRepository.findAllTrackable();

    for (const flight of flights) {
      const callsign = trimCallsign(flight.callsign);
      const track = await this.adsbClient.getTrackHistory(callsign);
      await this.flightsRepository.updateFlightPath(flight.id, track);
    }
  }

  @OnEvent(FlightEventType.OnBlockWasReported)
  async storeFlightPathOnFlightEnd(event: FlightEvent): Promise<void> {
    const flight = await this.flightsRepository.getOneById(event.flightId);
    const callsign = trimCallsign(flight.callsign);

    const track = await this.adsbClient.getTrackHistory(callsign);
    await this.flightsRepository.updateFlightPath(event.flightId, track);
  }
}
