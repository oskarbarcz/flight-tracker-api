import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { QueryBus } from '@nestjs/cqrs';
import {
  BoardingWasStartedEvent,
  FlightEventType,
} from '../../../../../core/domain/events/dto/flight.events';
import { DiscordClient } from '../../../../../core/provider/discord/client/discord.client';
import { getErrorMessage } from '../../../../../core/utils/error-message';
import { GetFlightQuery } from '../../query/get-flight.query';
import { resolveFlightRoute } from '../../../model/flight-route';
import {
  calculateBlockTime,
  formatBoardingAnnouncement,
} from '../../../model/discord-message.formatter';

@Injectable()
export class PassengersBoardingNotificationListener {
  private readonly logger = new Logger(
    PassengersBoardingNotificationListener.name,
  );
  private readonly frontendBaseUrl: string;

  constructor(
    private readonly client: DiscordClient,
    private readonly queryBus: QueryBus,
    config: ConfigService,
  ) {
    this.frontendBaseUrl = config.getOrThrow<string>('FRONTEND_BASE_URL');
  }

  @OnEvent(FlightEventType.BoardingWasStarted)
  public async onBoardingStarted(
    event: BoardingWasStartedEvent,
  ): Promise<void> {
    const { flightId } = event.payload;

    try {
      const query = new GetFlightQuery(flightId);
      const flight = await this.queryBus.execute(query);
      const { departure, destination } = resolveFlightRoute(flight.airports);

      const content = formatBoardingAnnouncement({
        flightNumber: flight.flightNumber,
        departure: { city: departure.city, iataCode: departure.iataCode },
        destination: {
          city: destination.city,
          iataCode: destination.iataCode,
        },
        blockTime: calculateBlockTime(
          flight.timesheet.estimated?.offBlockTime as Date,
          flight.timesheet.estimated?.onBlockTime as Date,
        ),
        passengers: flight.loadsheets.preliminary?.passengers,
        flightUrl: `${this.frontendBaseUrl}/map/${flight.id}`,
      });

      await this.client.sendMessage({ flightId, content, type: 'departure' });
    } catch (error) {
      this.logger.warn(
        `Could not post boarding message to Discord for flight ${flightId}: ${getErrorMessage(error)}`,
      );
    }
  }
}
