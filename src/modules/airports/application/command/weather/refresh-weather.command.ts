import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { AirportWeatherRepository } from '../../../infra/database/airport-weather.repository';
import {
  AirportsRepository,
  WeatherAirport,
} from '../../../infra/database/airports.repository';
import { WeatherClient } from '../../../../../core/provider/weather/client/weather.client';
import { SayIntentionsClient } from '../../../../../core/provider/sayintentions/client/say-intentions.client';
import {
  WeatherInformationType,
  WeatherSource,
} from '../../../model/airport-weather.model';
import { WeatherReport } from '../../../infra/database/airport-weather.repository';
import { getErrorMessage } from '../../../../../core/utils/error-message';

const SAY_INTENTIONS_CONCURRENCY = 4;

export class RefreshWeatherCommand {
  constructor(public readonly airportIds?: string[]) {}
}

@CommandHandler(RefreshWeatherCommand)
export class RefreshWeatherHandler implements ICommandHandler<RefreshWeatherCommand> {
  private readonly logger = new Logger(RefreshWeatherHandler.name);

  constructor(
    private readonly weatherRepository: AirportWeatherRepository,
    private readonly airportsRepository: AirportsRepository,
    private readonly weatherClient: WeatherClient,
    private readonly sayIntentionsClient: SayIntentionsClient,
  ) {}

  async execute(command: RefreshWeatherCommand): Promise<void> {
    const airports = command.airportIds
      ? await this.airportsRepository.getIcaoCodes(command.airportIds)
      : await this.airportsRepository.listMonitored();

    if (airports.length === 0) {
      return;
    }

    const results = await Promise.allSettled([
      this.refreshFromAviationWeatherGov(airports),
      this.refreshFromSayIntentions(airports),
    ]);

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const source =
          index === 0
            ? WeatherSource.AviationWeatherGov
            : WeatherSource.SayIntentions;

        this.logger.error(
          `Weather refresh from ${source} failed: ${getErrorMessage(result.reason)}`,
        );
      }
    });
  }

  private async refreshFromAviationWeatherGov(
    airports: WeatherAirport[],
  ): Promise<void> {
    const icaoCodes = airports.map((airport) => airport.icaoCode);
    const lastFetched = new Date();
    const [metars, tafs] = await Promise.all([
      this.weatherClient.fetchMetar(icaoCodes),
      this.weatherClient.fetchTaf(icaoCodes),
    ]);

    for (const { airportId, icaoCode } of airports) {
      const reports = this.collect(lastFetched, {
        [WeatherInformationType.Metar]: metars.get(icaoCode),
        [WeatherInformationType.Taf]: tafs.get(icaoCode),
      });

      await this.store(
        airportId,
        icaoCode,
        WeatherSource.AviationWeatherGov,
        reports,
      );
    }
  }

  private async refreshFromSayIntentions(
    airports: WeatherAirport[],
  ): Promise<void> {
    for (let i = 0; i < airports.length; i += SAY_INTENTIONS_CONCURRENCY) {
      const batch = airports.slice(i, i + SAY_INTENTIONS_CONCURRENCY);

      await Promise.all(
        batch.map((airport) => this.refreshAirportFromSayIntentions(airport)),
      );
    }
  }

  private async refreshAirportFromSayIntentions({
    airportId,
    icaoCode,
  }: WeatherAirport): Promise<void> {
    try {
      const lastFetched = new Date();
      const weather = await this.sayIntentionsClient.fetchWeather(icaoCode);

      const reports = this.collect(lastFetched, {
        [WeatherInformationType.Atis]: weather.atis,
        [WeatherInformationType.Metar]: weather.metar,
        [WeatherInformationType.Taf]: weather.taf,
      });

      await this.store(
        airportId,
        icaoCode,
        WeatherSource.SayIntentions,
        reports,
      );
    } catch (error) {
      this.logger.error(
        `Could not refresh ${WeatherSource.SayIntentions} weather for ${icaoCode}: ${getErrorMessage(error)}`,
      );
    }
  }

  private collect(
    lastFetched: Date,
    contents: Partial<Record<WeatherInformationType, string | undefined>>,
  ): WeatherReport[] {
    return Object.entries(contents)
      .filter(([, content]) => content !== undefined)
      .map(([informationType, content]) => ({
        informationType: informationType as WeatherInformationType,
        content: content as string,
        lastFetched,
      }));
  }

  private async store(
    airportId: string,
    icaoCode: string,
    source: WeatherSource,
    reports: WeatherReport[],
  ): Promise<void> {
    if (reports.length === 0) {
      this.logger.warn(`No ${source} weather returned for ${icaoCode}`);
      return;
    }

    await this.weatherRepository.saveReports(airportId, source, reports);

    const stored = reports
      .map((report) => report.informationType.toUpperCase())
      .join(' + ');
    this.logger.log(`Refreshed ${source} ${stored} for ${icaoCode}`);
  }
}
