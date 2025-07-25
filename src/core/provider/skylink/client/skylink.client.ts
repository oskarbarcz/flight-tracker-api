import { ConfigService } from '@nestjs/config';
import { ConflictException, Logger, NotFoundException } from '@nestjs/common';
import { SkylinkAirportResponse } from '../type/skylink.types';

export class SkyLinkClient {
  private readonly logger = new Logger(SkyLinkClient.name);

  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
  ) {}

  async getAirportByIataCode(
    iataCode: string,
  ): Promise<SkylinkAirportResponse> {
    const url = `${this.baseUrl}/v1/airports?iata=${iataCode}`;

    try {
      const response = await fetch(url, {
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
        throw new NotFoundException(
          `No airport found for IATA code: ${iataCode}`,
        );
      }

      if (body.length > 1) {
        throw new ConflictException(
          `Multiple airports found for IATA code: ${iataCode}`,
        );
      }

      this.logger.log(`Using SkyLink to get airport ${iataCode}`);
      return body[0] as SkylinkAirportResponse;
    } catch (error) {
      this.logger.error(`Error using SkyLink to get airport ${iataCode}`);
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
