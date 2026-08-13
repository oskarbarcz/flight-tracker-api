import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { QueryBus } from '@nestjs/cqrs';
import {
  DelayReportWasAcceptedEvent,
  FlightEventType,
} from '../../../../../core/domain/events/dto/flight.events';
import { DiscordClient } from '../../../../../core/provider/discord/client/discord.client';
import { getErrorMessage } from '../../../../../core/utils/error-message';
import { GetDiscordRecipientQuery } from '../../../../users/application/query/get-discord-recipient.query';
import { DiscordNotification } from '../../../../users/model/discord-settings.model';
import { FlightsRepository } from '../../../infra/database/repository/flights.repository';
import { GetFlightQuery } from '../../query/get-flight.query';
import { formatDelayApproval } from '../../../model/discord-message.formatter';

@Injectable()
export class SendDelayApprovalListener {
  private readonly logger = new Logger(SendDelayApprovalListener.name);
  private readonly frontendBaseUrl: string;

  constructor(
    private readonly client: DiscordClient,
    private readonly queryBus: QueryBus,
    private readonly flightsRepository: FlightsRepository,
    config: ConfigService,
  ) {
    this.frontendBaseUrl = config.getOrThrow<string>('FRONTEND_BASE_URL');
  }

  @OnEvent(FlightEventType.DelayReportWasAccepted)
  public async onDelayReportAccepted(
    event: DelayReportWasAcceptedEvent,
  ): Promise<void> {
    const { flightId } = event.payload;

    try {
      const captainId = await this.flightsRepository.getCaptainId(flightId);

      if (captainId === null) {
        return;
      }

      const recipientQuery = new GetDiscordRecipientQuery(
        captainId,
        DiscordNotification.DelayUpdates,
      );
      const discordId = await this.queryBus.execute(recipientQuery);

      if (discordId === null) {
        return;
      }

      const flightQuery = new GetFlightQuery(flightId);
      const flight = await this.queryBus.execute(flightQuery);

      const content = formatDelayApproval({
        flightNumber: flight.flightNumber,
        flightUrl: `${this.frontendBaseUrl}/flight/${flightId}/delay`,
      });

      await this.client.sendDirectMessage(discordId, {
        flightId,
        content,
        type: 'delay-approval',
      });
    } catch (error) {
      this.logger.warn(
        `Could not send delay approval to Discord for flight ${flightId}: ${getErrorMessage(error)}`,
      );
    }
  }
}
