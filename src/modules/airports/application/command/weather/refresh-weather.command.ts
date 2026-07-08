import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { AirportWeatherRepository } from '../../../infra/database/airport-weather.repository';
import { WeatherClient } from '../../../../../core/provider/weather/client/weather.client';

export class RefreshWeatherCommand {
  constructor(public readonly airportIds?: string[]) {}
}

@CommandHandler(RefreshWeatherCommand)
export class RefreshWeatherHandler implements ICommandHandler<RefreshWeatherCommand> {
  private readonly logger = new Logger(RefreshWeatherHandler.name);

  constructor(
    private readonly repository: AirportWeatherRepository,
    private readonly weatherClient: WeatherClient,
  ) {}

  async execute(command: RefreshWeatherCommand): Promise<void> {
    const airports = command.airportIds
      ? await this.repository.getIcaoCodes(command.airportIds)
      : await this.repository.listWatched();

    if (airports.length === 0) {
      return;
    }

    const icaoCodes = airports.map((airport) => airport.icaoCode);
    const fetchedAt = new Date();
    const [metars, tafs] = await Promise.all([
      this.weatherClient.fetchMetar(icaoCodes),
      this.weatherClient.fetchTaf(icaoCodes),
    ]);

    for (const { airportId, icaoCode } of airports) {
      const metar = metars.get(icaoCode);
      const taf = tafs.get(icaoCode);

      await this.repository.saveWeather(airportId, {
        metar,
        metarLastUpdate: metar !== undefined ? fetchedAt : undefined,
        taf,
        tafLastUpdate: taf !== undefined ? fetchedAt : undefined,
      });

      const updated = [
        metar !== undefined ? 'METAR' : null,
        taf !== undefined ? 'TAF' : null,
      ].filter((report): report is string => report !== null);

      if (updated.length > 0) {
        this.logger.log(`Refreshed ${updated.join(' + ')} for ${icaoCode}.`);
      } else {
        this.logger.warn(`No weather returned for ${icaoCode}.`);
      }
    }
  }
}
