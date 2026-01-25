import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { OperationalFlightPlan } from '../type/simbrief.types';

@Injectable()
export class SimbriefClient {
  private readonly logger = new Logger(SimbriefClient.name);

  constructor(private readonly baseUrl: string) {}

  async getOperationalFlightPlan(
    userId: string,
  ): Promise<OperationalFlightPlan> {
    const url = this.getApiUrl(userId);

    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    this.logger.log(`Simbrief OFP downloaded for user ${userId}`);

    return (await response.json()) as OperationalFlightPlan;
  }

  private getApiUrl(userId: string): string {
    return `${this.baseUrl}/api/xml.fetcher.php?userid=${userId}&json=2`;
  }
}

export const SimbriefClientProvider = {
  provide: SimbriefClient,
  useFactory: (config: ConfigService) => {
    const baseUrl = config.get<string>('SIMBRIEF_API_HOST') as string;

    return new SimbriefClient(baseUrl);
  },
  inject: [ConfigService],
};
