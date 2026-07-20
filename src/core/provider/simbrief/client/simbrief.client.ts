import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { OperationalFlightPlan } from '../type/simbrief.types';
import { getErrorMessage } from '../../../utils/error-message';
import { fetchWithRetry } from '../../http/fetch-with-retry';

@Injectable()
export class SimbriefClient {
  private readonly logger = new Logger(SimbriefClient.name);

  constructor(private readonly baseUrl: string) {}

  async getOperationalFlightPlan(
    userId: string,
  ): Promise<OperationalFlightPlan> {
    const url = this.getApiUrl(userId);

    try {
      const response = await fetchWithRetry(url, {
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      this.logger.log(`Simbrief OFP downloaded for user ${userId}`);

      return (await response.json()) as OperationalFlightPlan;
    } catch (error) {
      const message = getErrorMessage(error);
      this.logger.error(
        `Error fetching Simbrief OFP for user ${userId}: ${message}`,
      );
      throw error;
    }
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
