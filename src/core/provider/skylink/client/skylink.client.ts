import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { SkylinkAirportResponse } from '../type/skylink.types';
import {
  MultipleSkylinkAirportsFoundError,
  SkylinkAirportNotFoundError,
} from './skylink.error';
import { fetchWithRetry } from '../../http/fetch-with-retry';

@Injectable()
export class SkyLinkClient {
  private readonly logger = new Logger(SkyLinkClient.name);

  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
  ) {}

  async getAirportByIataCode(
    iataCode: string,
  ): Promise<SkylinkAirportResponse> {
    return this.findAirportBy('iata', iataCode);
  }

  async getAirportByIcaoCode(
    icaoCode: string,
  ): Promise<SkylinkAirportResponse> {
    return this.findAirportBy('icao', icaoCode);
  }

  private async findAirportBy(
    codeType: 'iata' | 'icao',
    code: string,
  ): Promise<SkylinkAirportResponse> {
    const url = `${this.baseUrl}/v1/airports?${codeType}=${code}`;
    const label = codeType.toUpperCase();

    try {
      const response = await fetchWithRetry(url, {
        headers: {
          'X-Api-Key': this.apiKey,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }
      const body = (await response.json()) as SkylinkAirportResponse[];

      if (body.length === 0) {
        throw new SkylinkAirportNotFoundError(label, code);
      }

      if (body.length > 1) {
        throw new MultipleSkylinkAirportsFoundError(label, code);
      }

      this.logger.log(`Using SkyLink to get airport ${code}`);
      return body[0] as SkylinkAirportResponse;
    } catch (error) {
      this.logger.error(`Error using SkyLink to get airport ${code}`);
      throw error;
    }
  }
}

export const SkyLinkClientProvider = {
  provide: SkyLinkClient,
  useFactory: (config: ConfigService) => {
    const baseUrl = config.get<string>('SKYLINK_API_HOST') as string;
    const apiKey: string = config.get<string>('SKYLINK_API_TOKEN') as string;

    return new SkyLinkClient(baseUrl, apiKey);
  },
  inject: [ConfigService],
};
