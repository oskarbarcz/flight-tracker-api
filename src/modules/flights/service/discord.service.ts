import { OnEvent } from '@nestjs/event-emitter';
import { FlightEventType } from '../../../core/events/flight';
import { NewFlightEvent } from '../dto/event.dto';
import { DiscordClient } from '../../../core/provider/discord/client/discord.client';
import {
  AirportType,
  AirportWithType,
} from '../../airports/entity/airport.entity';
import { FlightsService } from './flights.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DiscordService {
  constructor(
    private readonly client: DiscordClient,
    private readonly flightsService: FlightsService,
  ) {}

  @OnEvent(FlightEventType.BoardingWasStarted)
  public async onBoardingStarted(event: NewFlightEvent): Promise<void> {
    const flight = await this.flightsService.find(event.flightId);

    const departure = flight.airports.find(
      (airport) => airport.type === AirportType.Departure,
    ) as AirportWithType;
    const destination = flight.airports.find(
      (airport) => airport.type === AirportType.Destination,
    ) as AirportWithType;

    const blockTime = this.calculateBlockTime(
      flight.timesheet.estimated?.offBlockTime as Date,
      flight.timesheet.estimated?.onBlockTime as Date,
    );

    const content =
      `:airplane_departure: :airplane_departure: :airplane_departure:\n\n` +
      `Flight **${flight.callsign}**` +
      ` from **${departure.city} (${departure.iataCode})**` +
      ` to **${destination.city} (${destination.iataCode})**` +
      ` has started boarding!\n` +
      `Estimated block time: **${blockTime}hrs**, ` +
      `Passengers on board: **${flight.loadsheets.preliminary?.passengers}**\n\n` +
      `Track flight live on <:ft:1436299102626386031> ` +
      `[Flight Tracker](https://flights.barcz.me/live-tracking/${flight.id})!`;

    await this.client.sendMessage({
      flightId: event.flightId,
      content,
      type: 'departure',
    });
  }

  @OnEvent(FlightEventType.OnBlockWasReported)
  public async onOnblockReported(event: NewFlightEvent): Promise<void> {
    const flight = await this.flightsService.find(event.flightId);

    const departure = flight.airports.find(
      (airport) => airport.type === AirportType.Departure,
    ) as AirportWithType;
    const destination = flight.airports.find(
      (airport) => airport.type === AirportType.Destination,
    ) as AirportWithType;

    const blockTime = this.calculateBlockTime(
      flight.timesheet.actual?.offBlockTime as Date,
      flight.timesheet.actual?.onBlockTime as Date,
    );

    const content =
      `:airplane_arriving: :airplane_arriving: :airplane_arriving:\n\n` +
      `Flight **${flight.callsign}**` +
      ` from **${departure.city} (${departure.iataCode})**` +
      ` to **${destination.city} (${destination.iataCode})**` +
      ` just arrived!\n` +
      `Actual block time: **${blockTime}hrs**\n\n` +
      `See flight path on <:ft:1436299102626386031> ` +
      `[Flight Tracker](https://flights.barcz.me/live-tracking/${flight.id})!`;

    await this.client.sendMessage({
      flightId: event.flightId,
      content,
      type: 'arrival',
    });
  }

  public calculateBlockTime(offBlockTime: Date, onBlockTime: Date): string {
    const diffMs = onBlockTime.getTime() - offBlockTime.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
}
