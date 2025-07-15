import { Injectable, Logger } from '@nestjs/common';
import { FlightsRepository } from '../repository/flights.repository';
import { OnEvent } from '@nestjs/event-emitter';
import { FlightEventType } from '../../../core/events/flight';
import { AdsbClient } from '../../../core/provider/adsb/client/adsb.client';
import { FlightEvent } from '../entity/event.entity';

@Injectable()
export class PositionService {
  private readonly logger = new Logger(PositionService.name);

  constructor(
    private readonly adsbClient: AdsbClient,
    private readonly flightsRepository: FlightsRepository,
  ) {}

  @OnEvent(FlightEventType.OnBlockWasReported)
  async storeFlightTrack(event: FlightEvent): Promise<void> {
    const flight = await this.flightsRepository.getOneById(event.flightId);
    const callsign = flight.callsign.split(' ').join('').toUpperCase();

    const track = await this.adsbClient.getTrackHistory(callsign);
    this.logger.log(
      `Downloaded track for flight ${flight.callsign} (points: ${track.length})`,
    );

    await this.flightsRepository.updateTrack(event.flightId, track);
  }
}
