import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdsbFlightTrack, transformPositionReport } from '../type/adsb.types';
import * as path from 'path';
import { promises as fs } from 'fs';

@Injectable()
export class AdsbClient {
  private readonly logger = new Logger(AdsbClient.name);

  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
  ) {}

  async getTrackHistory(callsign: string): Promise<AdsbFlightTrack> {
    const url = `${this.baseUrl}/api/v1/position/${callsign}`;

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const body = await response.json();

      this.logger.log(
        `Downloaded track for flight ${callsign} (points: ${body.length})`,
      );

      return body.map(transformPositionReport);
    } catch (error) {
      this.logger.error(
        `Error fetching track history for ${callsign}: ${error.message}`,
      );
      throw error;
    }
  }
}

export class TestAdsbClient extends AdsbClient {
  override async getTrackHistory(callsign: string): Promise<AdsbFlightTrack> {
    const trackHistory = await super.getTrackHistory(callsign);

    const outputDir = path.join(process.cwd(), 'test-data', 'adsb');
    const filePath = path.join(outputDir, `${callsign}.json`);
    await fs.mkdir(outputDir, { recursive: true });
    const fileContent = JSON.stringify(trackHistory, null, 2);
    await fs.writeFile(filePath, fileContent, { encoding: 'utf-8' });

    return trackHistory;
  }
}

export const AdsbClientProvider = {
  provide: AdsbClient,
  useFactory: (config: ConfigService) => {
    const isProduction = config.get<string>('NODE_ENV') === 'production';
    const baseUrl = config.get<string>('ADSB_API_HOST') as string;
    const apiKey: string = config.get<string>('ADSB_API_TOKEN') as string;

    if (isProduction) {
      return new AdsbClient(baseUrl, apiKey);
    } else {
      // For any environment that is not 'production'
      return new TestAdsbClient(baseUrl, apiKey);
    }
  },
  inject: [ConfigService],
};
