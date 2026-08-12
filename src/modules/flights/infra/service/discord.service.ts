import { OnEvent } from '@nestjs/event-emitter';
import {
  FlightEventType,
  BoardingWasStartedEvent,
  OnBlockWasReportedEvent,
  PilotCheckedInEvent,
} from '../../../../core/domain/events/dto/flight.events';
import { DiscordClient } from '../../../../core/provider/discord/client/discord.client';
import {
  AirportType,
  AirportWithType,
} from '../../../airports/model/airport.model';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetFlightQuery } from '../../application/query/get-flight.query';
import { GetOfpQuery } from '../../application/query/get-ofp.query';
import { GetUserDiscordIdQuery } from '../../../users/application/query/get-user-discord-id.query';
import { GetUserDiscordSettingsQuery } from '../../../users/application/query/get-user-discord-settings.query';
import { GetUserWeatherSourceQuery } from '../../../users/application/query/get-user-weather-source.query';
import { GetAirportWeatherQuery } from '../../../airports/application/query/weather/get-airport-weather.query';
import { RefreshWeatherCommand } from '../../../airports/application/command/weather/refresh-weather.command';
import { WeatherSourceFilter } from '../../../airports/infra/http/request/weather.dto';
import {
  GetAirportWeatherResponse,
  WeatherInformationType,
  WeatherSource,
} from '../../../airports/model/airport-weather.model';
import { FlightOfpDetails } from '../../model/flight.model';
import { FlightOfpNotFoundError } from '../../model/error/flight.error';
import {
  BriefingWeather,
  formatFlightBriefing,
  formatFlightNumber,
} from './flight-briefing.formatter';

@Injectable()
export class DiscordService {
  private readonly logger = new Logger(DiscordService.name);
  private readonly frontendBaseUrl: string;

  constructor(
    private readonly client: DiscordClient,
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    config: ConfigService,
  ) {
    this.frontendBaseUrl = config.getOrThrow<string>('FRONTEND_BASE_URL');
  }

  @OnEvent(FlightEventType.BoardingWasStarted)
  public async onBoardingStarted(
    event: BoardingWasStartedEvent,
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
        flight.timesheet.estimated?.offBlockTime as Date,
        flight.timesheet.estimated?.onBlockTime as Date,
      );

      const content =
        `:airplane_departure: :airplane_departure: :airplane_departure:\n\n` +
        `Flight **${formatFlightNumber(flight.flightNumber)}**` +
        ` from **${departure.city} (${departure.iataCode})**` +
        ` to **${destination.city} (${destination.iataCode})**` +
        ` has started boarding!\n` +
        `Estimated block time: **${blockTime}hrs**, ` +
        `Passengers on board: **${flight.loadsheets.preliminary?.passengers}**\n\n` +
        `Track flight live on <:ft:1436299102626386031> ` +
        `[Flight Tracker](${this.frontendBaseUrl}/map/${flight.id})!`;

      await this.client.sendMessage({
        flightId: event.payload.flightId,
        content,
        type: 'departure',
      });
    } catch (error) {
      this.logger.warn(
        `Could not post boarding message to Discord for flight ${event.payload.flightId}: ${error}`,
      );
    }
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

      const content =
        `:airplane_arriving: :airplane_arriving: :airplane_arriving:\n\n` +
        `Flight **${formatFlightNumber(flight.flightNumber)}**` +
        ` from **${departure.city} (${departure.iataCode})**` +
        ` to **${destination.city} (${destination.iataCode})**` +
        ` just arrived!\n` +
        `Actual block time: **${blockTime}hrs**\n\n` +
        `See flight path on <:ft:1436299102626386031> ` +
        `[Flight Tracker](${this.frontendBaseUrl}/map/${flight.id})!`;

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

      const departure = flight.airports.find(
        (airport) => airport.type === AirportType.Departure,
      ) as AirportWithType;
      const destination = flight.airports.find(
        (airport) => airport.type === AirportType.Destination,
      ) as AirportWithType;

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
        ofpDocumentUrl: ofp === null ? null : ofp.ofpDocumentUrl,
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
        `Could not send briefing to Discord for flight ${flightId}: ${error}`,
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
