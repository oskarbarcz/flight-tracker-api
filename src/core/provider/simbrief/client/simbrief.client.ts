import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { OperationalFlightPlan, RouteMapData } from '../type/simbrief.types';
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

  async findRouteMapData(url: string): Promise<RouteMapData | null> {
    let body: string;

    try {
      const response = await fetchWithRetry(url, {
        headers: { Accept: 'text/plain' },
      });

      if (!response.ok) {
        this.logger.warn(
          `Simbrief answered ${response.status.toString()} for route map data, continuing without ETOPS range rings`,
        );

        return null;
      }

      body = await response.text();
    } catch (error) {
      this.logger.warn(
        `Could not fetch Simbrief route map data, continuing without ETOPS range rings: ${getErrorMessage(error)}`,
      );

      return null;
    }

    return this.readRouteMapData(body);
  }

  private readRouteMapData(body: string): RouteMapData | null {
    const mapData: RouteMapData = {
      etopsRule: this.readMapNumber(body, 'etopsrule'),
      etopsRuleDistance: this.readMapNumber(body, 'etopsruledist'),
      etopsThresholdMinutes: this.readMapNumber(body, 'etopsthreshold'),
      tracksDirection: this.readMapString(body, 'natsdir'),
    };

    const hasAnyValue = Object.values(mapData).some(
      (value) => value !== undefined,
    );

    if (!hasAnyValue) {
      this.logger.warn(
        'Simbrief route map data carried no ETOPS figures, continuing without range rings',
      );

      return null;
    }

    return mapData;
  }

  private readMapNumber(body: string, name: string): number | undefined {
    const match = new RegExp(
      `var\\s+${name}\\s*=\\s*(-?\\d+(?:\\.\\d+)?)`,
    ).exec(body);

    if (match === null) {
      return undefined;
    }

    const value = Number(match[1]);

    return Number.isFinite(value) ? value : undefined;
  }

  private readMapString(body: string, name: string): string | undefined {
    const match = new RegExp(`var\\s+${name}\\s*=\\s*"([^"]*)"`).exec(body);

    return match === null || match[1].length === 0 ? undefined : match[1];
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
