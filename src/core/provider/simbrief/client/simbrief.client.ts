import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { OperationalFlightPlan } from '../type/simbrief.types';
import { getErrorMessage } from '../../../utils/error-message';
import { fetchWithRetry } from '../../http/fetch-with-retry';
import {
  SimbriefUnavailableError,
  SimbriefUserNotFoundError,
} from '../error/simbrief.error';

const UNKNOWN_USER_STATUS = 'unknown userid';
const SUCCESS_STATUS = 'success';

@Injectable()
export class SimbriefClient {
  private readonly logger = new Logger(SimbriefClient.name);

  constructor(private readonly baseUrl: string) {}

  async getOperationalFlightPlan(
    userId: string,
  ): Promise<OperationalFlightPlan> {
    const ofp = await this.findOperationalFlightPlan(userId);

    if (ofp === null) {
      throw new SimbriefUserNotFoundError();
    }

    return ofp;
  }

  async findOperationalFlightPlan(
    userId: string,
  ): Promise<OperationalFlightPlan | null> {
    const url = this.getApiUrl(userId);
    let response: Response;

    try {
      response = await fetchWithRetry(url, {
        headers: { Accept: 'application/json' },
      });
    } catch (error) {
      this.logger.error(
        `Error fetching Simbrief OFP for user ${userId}: ${getErrorMessage(error)}`,
      );

      throw new SimbriefUnavailableError();
    }

    const payload = await this.readPayload(response);

    if (this.isUnknownUser(response, payload)) {
      this.logger.warn(`Simbrief does not know user ${userId}`);

      return null;
    }

    if (!response.ok || payload === null || !this.isFetched(payload)) {
      this.logger.error(
        `Simbrief answered ${response.status.toString()} for user ${userId} with no usable flight plan`,
      );

      throw new SimbriefUnavailableError();
    }

    this.logger.log(`Simbrief OFP downloaded for user ${userId}`);

    return payload;
  }

  private async readPayload(
    response: Response,
  ): Promise<OperationalFlightPlan | null> {
    try {
      return (await response.json()) as OperationalFlightPlan;
    } catch {
      return null;
    }
  }

  private isUnknownUser(
    response: Response,
    payload: OperationalFlightPlan | null,
  ): boolean {
    return (
      response.status === 400 ||
      this.readStatus(payload).includes(UNKNOWN_USER_STATUS)
    );
  }

  private isFetched(payload: OperationalFlightPlan): boolean {
    const status = this.readStatus(payload);

    return status.length === 0 || status === SUCCESS_STATUS;
  }

  private readStatus(payload: OperationalFlightPlan | null): string {
    const status = payload?.fetch?.status;

    return typeof status === 'string' ? status.toLowerCase() : '';
  }

  private getApiUrl(userId: string): string {
    return `${this.baseUrl}/api/xml.fetcher.php?userid=${encodeURIComponent(userId)}&json=2`;
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
