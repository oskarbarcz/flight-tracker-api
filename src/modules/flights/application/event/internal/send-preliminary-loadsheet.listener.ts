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
import { GetDiscordRecipientQuery } from '../../../../users/application/query/get-discord-recipient.query';
import { DiscordNotification } from '../../../../users/model/discord-settings.model';
import { ListFlightCrewQuery } from '../../../../crew/application/query/list-flight-crew.query';
import { FlightsRepository } from '../../../infra/database/repository/flights.repository';
import { GetFlightQuery } from '../../query/get-flight.query';
import { formatLoadsheet } from '../../../model/discord-message.formatter';

@Injectable()
export class SendPreliminaryLoadsheetListener {
  private readonly logger = new Logger(SendPreliminaryLoadsheetListener.name);
  private readonly frontendBaseUrl: string;

  constructor(
    private readonly client: DiscordClient,
    private readonly queryBus: QueryBus,
    private readonly flightsRepository: FlightsRepository,
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
      const captainId = await this.flightsRepository.getCaptainId(flightId);

      if (captainId === null) {
        return;
      }

      const recipientQuery = new GetDiscordRecipientQuery(
        captainId,
        DiscordNotification.PreliminaryLoadsheet,
      );
      const discordId = await this.queryBus.execute(recipientQuery);

      if (discordId === null) {
        return;
      }

      const flightQuery = new GetFlightQuery(flightId);
      const flight = await this.queryBus.execute(flightQuery);
      const loadsheet = flight.loadsheets.preliminary;

      if (!loadsheet) {
        return;
      }

      const crewQuery = new ListFlightCrewQuery(flightId);
      const crew = await this.queryBus.execute(crewQuery);

      const content = formatLoadsheet({
        kind: 'preliminary',
        flightNumber: flight.flightNumber,
        crew: crew.map((member) => ({
          name: member.name,
          role: member.role,
        })),
        loadsheet,
        flightUrl: `${this.frontendBaseUrl}/flight/${flightId}`,
      });

      await this.client.sendDirectMessage(discordId, {
        flightId,
        content,
        type: 'preliminary-loadsheet',
      });
    } catch (error) {
      this.logger.warn(
        `Could not send preliminary loadsheet to Discord for flight ${flightId}: ${getErrorMessage(error)}`,
      );
    }
  }
}
