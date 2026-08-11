import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import {
  SayIntentionsWeather,
  SayIntentionsWeatherPayload,
} from '../type/say-intentions.types';
import { getErrorMessage } from '../../../utils/error-message';
import { fetchWithRetry } from '../../http/fetch-with-retry';

@Injectable()
export class SayIntentionsClient {
  private readonly logger = new Logger(SayIntentionsClient.name);

  constructor(private readonly baseUrl: string) {}

  async fetchWeather(icaoCode: string): Promise<SayIntentionsWeather> {
    const url = `${this.baseUrl}/api/mep/getWX?icao=${icaoCode.toLowerCase()}`;

    try {
      const response = await fetchWithRetry(url, {
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch weather for ${icaoCode}: ${response.statusText}`,
        );
      }

      const payload = (await response.json()) as SayIntentionsWeatherPayload;
      this.logger.log(`Fetched SayIntentions weather for ${icaoCode}`);

      return {
        metar: this.text(payload.metar),
        taf: this.text(payload.taf),
        atis: this.text(payload.atis),
      };
    } catch (error) {
      const message = getErrorMessage(error);
      this.logger.error(
        `Error fetching SayIntentions weather for ${icaoCode}: ${message}`,
      );
      throw error;
    }
  }

  private text(value: string | null | undefined): string | undefined {
    const trimmed = value?.trim();

    return trimmed ? trimmed : undefined;
  }
}

export const SayIntentionsClientProvider = {
  provide: SayIntentionsClient,
  useFactory: (config: ConfigService) => {
    const baseUrl = config.getOrThrow<string>('SAY_INTENTIONS_API_HOST');

    return new SayIntentionsClient(baseUrl);
  },
  inject: [ConfigService],
};
