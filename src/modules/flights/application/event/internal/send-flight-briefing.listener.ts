import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  FlightEventType,
  PilotCheckedInEvent,
} from '../../../../../core/domain/events/dto/flight.events';
import { DiscordClient } from '../../../../../core/provider/discord/client/discord.client';
import { getErrorMessage } from '../../../../../core/utils/error-message';
import { GetAirportWeatherQuery } from '../../../../airports/application/query/weather/get-airport-weather.query';
import { RefreshWeatherCommand } from '../../../../airports/application/command/weather/refresh-weather.command';
import { WeatherSourceFilter } from '../../../../airports/infra/http/request/weather.dto';
import {
  GetAirportWeatherResponse,
  WeatherInformationType,
  WeatherSource,
} from '../../../../airports/model/airport-weather.model';
import { GetUserDiscordIdQuery } from '../../../../users/application/query/get-user-discord-id.query';
import { GetUserDiscordSettingsQuery } from '../../../../users/application/query/get-user-discord-settings.query';
import { GetUserWeatherSourceQuery } from '../../../../users/application/query/get-user-weather-source.query';
import { GetFlightQuery } from '../../query/get-flight.query';
import { GetOfpQuery } from '../../query/get-ofp.query';
import { FlightOfpDetails } from '../../../model/flight.model';
import { FlightOfpNotFoundError } from '../../../model/error/flight.error';
import { resolveFlightRoute } from '../../../model/flight-route';
import {
  BriefingWeather,
  formatFlightBriefing,
} from '../../../model/discord-message.formatter';

@Injectable()
export class SendFlightBriefingListener {
  private readonly logger = new Logger(SendFlightBriefingListener.name);
  private readonly frontendBaseUrl: string;

  constructor(
    private readonly client: DiscordClient,
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    config: ConfigService,
  ) {
    this.frontendBaseUrl = config.getOrThrow<string>('FRONTEND_BASE_URL');
  }

  @OnEvent(FlightEventType.PilotCheckedIn)
  public async onPilotCheckedIn(event: PilotCheckedInEvent): Promise<void> {
    const { flightId, actorId } = event.payload;

    if (actorId === null) {
      return;
    }

    try {
      const settingsQuery = new GetUserDiscordSettingsQuery(actorId);
      const settings = await this.queryBus.execute(settingsQuery);

      if (!settings.briefingsEnabled) {
        return;
      }

      const discordIdQuery = new GetUserDiscordIdQuery(actorId);
      const discordId = await this.queryBus.execute(discordIdQuery);

      if (discordId === null) {
        return;
      }

      const flightQuery = new GetFlightQuery(flightId);
      const flight = await this.queryBus.execute(flightQuery);
      const ofp = await this.resolveOfp(flightId);
      const { departure, destination } = resolveFlightRoute(flight.airports);

      const content = formatFlightBriefing({
        flightNumber: flight.flightNumber,
        departure: { city: departure.city, iataCode: departure.iataCode },
        destination: {
          city: destination.city,
          iataCode: destination.iataCode,
        },
        aircraft: {
          registration: flight.aircraft.registration,
          type: flight.aircraft.airframe.name,
        },
        schedule: flight.timesheet.estimated,
        weather: await this.resolveDepartureWeather(departure.id, actorId),
        flightUrl: `${this.frontendBaseUrl}/flight/${flight.id}`,
      });

      await this.client.sendDirectMessage(discordId, {
        flightId,
        content,
        type: 'briefing',
        attachments: ofp === null ? [] : [ofp.ofpDocumentUrl],
      });
    } catch (error) {
      this.logger.warn(
        `Could not send briefing to Discord for flight ${flightId}: ${getErrorMessage(error)}`,
      );
    }
  }

  private async resolveDepartureWeather(
    airportId: string,
    userId: string,
  ): Promise<BriefingWeather> {
    let reports = await this.readWeather(airportId);

    if (reports.length === 0) {
      const command = new RefreshWeatherCommand([airportId]);
      await this.commandBus.execute(command);
      reports = await this.readWeather(airportId);
    }

    if (reports.length === 0) {
      return {};
    }

    const sourceQuery = new GetUserWeatherSourceQuery(userId);
    const preferred = await this.queryBus.execute(sourceQuery);

    return {
      atis: this.pickReport(reports, WeatherInformationType.Atis, preferred),
      metar: this.pickReport(reports, WeatherInformationType.Metar, preferred),
      taf: this.pickReport(reports, WeatherInformationType.Taf, preferred),
    };
  }

  private async readWeather(
    airportId: string,
  ): Promise<GetAirportWeatherResponse[]> {
    const query = new GetAirportWeatherQuery(
      airportId,
      WeatherSourceFilter.All,
    );

    return this.queryBus.execute(query);
  }

  private pickReport(
    reports: GetAirportWeatherResponse[],
    informationType: WeatherInformationType,
    preferred: WeatherSource,
  ): string | undefined {
    const matching = reports.filter(
      (report) => report.informationType === informationType,
    );
    const chosen =
      matching.find((report) => report.source === preferred) ?? matching[0];

    return chosen?.content;
  }

  private async resolveOfp(flightId: string): Promise<FlightOfpDetails | null> {
    try {
      const query = new GetOfpQuery(flightId);

      return await this.queryBus.execute(query);
    } catch (error) {
      if (error instanceof FlightOfpNotFoundError) {
        return null;
      }

      throw error;
    }
  }
}
