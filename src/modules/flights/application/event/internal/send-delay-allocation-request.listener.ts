import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { QueryBus } from '@nestjs/cqrs';
import {
  DelayRequestWasCreatedEvent,
  FlightEventType,
} from '../../../../../core/domain/events/dto/flight.events';
import { DiscordClient } from '../../../../../core/provider/discord/client/discord.client';
import { getErrorMessage } from '../../../../../core/utils/error-message';
import { GetDiscordRecipientQuery } from '../../../../users/application/query/get-discord-recipient.query';
import { DiscordNotification } from '../../../../users/model/discord-settings.model';
import { FlightsRepository } from '../../../infra/database/repository/flights.repository';
import { GetFlightQuery } from '../../query/get-flight.query';
import { GetDelayRequestQuery } from '../../query/delay/get-delay-request.query';
import { formatDelayAllocationRequest } from '../../../model/discord-message.formatter';

@Injectable()
export class SendDelayAllocationRequestListener {
  private readonly logger = new Logger(SendDelayAllocationRequestListener.name);
  private readonly frontendBaseUrl: string;

  constructor(
    private readonly client: DiscordClient,
    private readonly queryBus: QueryBus,
    private readonly flightsRepository: FlightsRepository,
    config: ConfigService,
  ) {
    this.frontendBaseUrl = config.getOrThrow<string>('FRONTEND_BASE_URL');
  }

  @OnEvent(FlightEventType.DelayRequestWasCreated)
  public async onDelayRequestCreated(
    event: DelayRequestWasCreatedEvent,
  ): Promise<void> {
    const { flightId } = event.payload;

    try {
      const captainId = await this.flightsRepository.getCaptainId(flightId);

      if (captainId === null) {
        return;
      }

      const recipientQuery = new GetDiscordRecipientQuery(
        captainId,
        DiscordNotification.DelayAllocation,
      );
      const discordId = await this.queryBus.execute(recipientQuery);

      if (discordId === null) {
        return;
      }

      const flightQuery = new GetFlightQuery(flightId);
      const flight = await this.queryBus.execute(flightQuery);

      const delayQuery = new GetDelayRequestQuery(flightId);
      const delay = await this.queryBus.execute(delayQuery);

      const content = formatDelayAllocationRequest({
        flightNumber: flight.flightNumber,
        delayMinutes: delay.totalDelayMinutes,
        allocationUrl: `${this.frontendBaseUrl}/flight/${flightId}/delay`,
      });

      await this.client.sendDirectMessage(discordId, {
        flightId,
        content,
        type: 'delay-allocation',
      });
    } catch (error) {
      this.logger.warn(
        `Could not send delay allocation request to Discord for flight ${flightId}: ${getErrorMessage(error)}`,
      );
    }
  }
}
