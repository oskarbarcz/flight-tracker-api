import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdsbFlightTrack, transformPositionReport } from '../type/adsb.types';

@Injectable()
export class AdsbClient {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
  ) {}

  async getTrackHistory(callsign: string): Promise<AdsbFlightTrack> {
    const url = `${this.baseUrl}/api/v1/position/${callsign}`;

    return fetch(url, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: 'application/json',
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }

        return response.json();
      })
      .then((data) => data.map(transformPositionReport));
  }
}

export const AdsbClientProvider = {
  provide: AdsbClient,
  useFactory: (configService: ConfigService) => {
    const baseUrl = configService.get<string>('ADSB_API_HOST') as string;
    const apiKey: string = configService.get<string>(
      'ADSB_API_TOKEN',
    ) as string;
    return new AdsbClient(baseUrl, apiKey);
  },
  inject: [ConfigService],
};
