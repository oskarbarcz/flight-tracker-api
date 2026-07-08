import { OnEvent } from '@nestjs/event-emitter';
import {
  FlightEventType,
  BoardingWasStartedEvent,
  OnBlockWasReportedEvent,
} from '../../../../core/domain/events/dto/flight.events';
import { DiscordClient } from '../../../../core/provider/discord/client/discord.client';
import {
  AirportType,
  AirportWithType,
} from '../../../airports/model/airport.model';
import { Injectable, Logger } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetFlightQuery } from '../../application/query/get-flight.query';

@Injectable()
export class DiscordService {
  private readonly logger = new Logger(DiscordService.name);

  constructor(
    private readonly client: DiscordClient,
    private readonly queryBus: QueryBus,
  ) {}

  @OnEvent(FlightEventType.BoardingWasStarted)
  public async onBoardingStarted(
    event: BoardingWasStartedEvent,
  ): Promise<void> {
    const query = new GetFlightQuery(event.payload.flightId);
    const flight = await this.queryBus.execute(query);

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

    const formattedFlightNumber = flight.flightNumber.replace(/^(.{2})/, '$1 ');

    const content =
      `:airplane_departure: :airplane_departure: :airplane_departure:\n\n` +
      `Flight **${formattedFlightNumber}**` +
      ` from **${departure.city} (${departure.iataCode})**` +
      ` to **${destination.city} (${destination.iataCode})**` +
      ` has started boarding!\n` +
      `Estimated block time: **${blockTime}hrs**, ` +
      `Passengers on board: **${flight.loadsheets.preliminary?.passengers}**\n\n` +
      `Track flight live on <:ft:1436299102626386031> ` +
      `[Flight Tracker](https://flights.barcz.me/map/${flight.id})!`;

    await this.client.sendMessage({
      flightId: event.payload.flightId,
      content,
      type: 'departure',
    });
  }

  @OnEvent(FlightEventType.OnBlockWasReported)
  public async onOnblockReported(
    event: OnBlockWasReportedEvent,
  ): Promise<void> {
    try {
      const query = new GetFlightQuery(event.payload.flightId);
      const flight = await this.queryBus.execute(query);

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

      const formattedFlightNumber = flight.flightNumber.replace(
        /^(.{2})/,
        '$1 ',
      );

      const content =
        `:airplane_arriving: :airplane_arriving: :airplane_arriving:\n\n` +
        `Flight **${formattedFlightNumber}**` +
        ` from **${departure.city} (${departure.iataCode})**` +
        ` to **${destination.city} (${destination.iataCode})**` +
        ` just arrived!\n` +
        `Actual block time: **${blockTime}hrs**\n\n` +
        `See flight path on <:ft:1436299102626386031> ` +
        `[Flight Tracker](https://flights.barcz.me/map/${flight.id})!`;

      await this.client.sendMessage({
        flightId: event.payload.flightId,
        content,
        type: 'arrival',
      });
    } catch (error) {
      this.logger.warn(
        `Could not post on-block message to Discord for flight ${event.payload.flightId}: ${error}`,
      );
    }
  }

  public calculateBlockTime(offBlockTime: Date, onBlockTime: Date): string {
    const diffMs = onBlockTime.getTime() - offBlockTime.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
}
