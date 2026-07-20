import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { WeatherReportKind, WeatherReportsByIcao } from '../type/weather.types';
import { getErrorMessage } from '../../../utils/error-message';
import { fetchWithRetry } from '../../http/fetch-with-retry';

const REPORT_TYPE_TOKENS = new Set(['METAR', 'SPECI', 'TAF']);

@Injectable()
export class WeatherClient {
  private readonly logger = new Logger(WeatherClient.name);

  constructor(private readonly baseUrl: string) {}

  async fetchMetar(icaoCodes: string[]): Promise<WeatherReportsByIcao> {
    return this.fetch(WeatherReportKind.Metar, icaoCodes);
  }

  async fetchTaf(icaoCodes: string[]): Promise<WeatherReportsByIcao> {
    return this.fetch(WeatherReportKind.Taf, icaoCodes);
  }

  private async fetch(
    kind: WeatherReportKind,
    icaoCodes: string[],
  ): Promise<WeatherReportsByIcao> {
    if (icaoCodes.length === 0) {
      return new Map();
    }

    const url = `${this.baseUrl}/api/data/${kind}?ids=${icaoCodes.join(',')}`;

    try {
      const response = await fetchWithRetry(url, {
        headers: { Accept: 'text/plain' },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${kind}: ${response.statusText}`);
      }

      const text = await response.text();
      this.logger.log(`Fetched ${kind} for ${icaoCodes.join(',')}`);

      return this.parse(text, icaoCodes);
    } catch (error) {
      const message = getErrorMessage(error);
      this.logger.error(
        `Error fetching ${kind} for ${icaoCodes.join(',')}: ${message}`,
      );
      throw error;
    }
  }

  private parse(text: string, icaoCodes: string[]): WeatherReportsByIcao {
    const requested = new Set(icaoCodes);
    const reports: WeatherReportsByIcao = new Map();

    let currentIcao: string | null = null;
    let currentLines: string[] = [];

    const flush = (): void => {
      if (
        currentIcao &&
        requested.has(currentIcao) &&
        !reports.has(currentIcao)
      ) {
        reports.set(
          currentIcao,
          currentLines.join(' ').replace(/\s+/g, ' ').trim(),
        );
      }
    };

    for (const rawLine of text.split('\n')) {
      if (rawLine.trim().length === 0) {
        continue;
      }

      const startsNewStation = !/^\s/.test(rawLine);
      if (startsNewStation) {
        flush();
        const tokens = rawLine.trim().split(/\s+/);
        currentIcao = REPORT_TYPE_TOKENS.has(tokens[0]) ? tokens[1] : tokens[0];
        currentLines = [rawLine.trim()];
      } else {
        currentLines.push(rawLine.trim());
      }
    }
    flush();

    return reports;
  }
}

export const WeatherClientProvider = {
  provide: WeatherClient,
  useFactory: (config: ConfigService) => {
    const baseUrl = config.get<string>('WEATHER_API_HOST') as string;

    return new WeatherClient(baseUrl);
  },
  inject: [ConfigService],
};
