import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import {
  AerolopaErrorBody,
  AerolopaErrorCode,
  AerolopaLayoutIndex,
  AerolopaResolution,
  AerolopaSeatMap,
  AerolopaSeatMapResponse,
} from '../type/aerolopa.types';
import {
  AerolopaUnavailableError,
  SeatMapNotFoundError,
  SeatMapUnreadableError,
} from '../error/aerolopa.error';
import { DomainError } from '../../../errors/domain-error';
import { getErrorMessage } from '../../../utils/error-message';
import { fetchWithRetry } from '../../http/fetch-with-retry';

const FETCH_OPTIONS = { timeoutMs: 30000, retries: 1, backoffMs: 500 };

const SEAT_MAP_ERRORS: Partial<
  Record<AerolopaErrorCode, new (slug: string) => DomainError>
> = {
  SEAT_MAP_NOT_FOUND: SeatMapNotFoundError,
  SEAT_MAP_UNREADABLE: SeatMapUnreadableError,
};

@Injectable()
export class AerolopaClient {
  private readonly logger = new Logger(AerolopaClient.name);

  constructor(
    private readonly baseUrl: string,
    private readonly functionSecret: string,
  ) {}

  async getSeatMap(slug: string): Promise<AerolopaSeatMap> {
    const body = await this.invoke<AerolopaSeatMapResponse>(
      'seatmap',
      { op: 'seatmap', slug },
      slug,
    );

    return body.seatMap;
  }

  async resolve(
    airlineIata: string,
    aircraftIata: string,
    includeSeatMaps = false,
  ): Promise<AerolopaResolution> {
    return this.invoke<AerolopaResolution>('seatmap', {
      op: 'resolve',
      airline: airlineIata.toUpperCase(),
      aircraft: aircraftIata.toUpperCase(),
      includeSeatMaps: String(includeSeatMaps),
    });
  }

  async listLayouts(): Promise<AerolopaLayoutIndex> {
    return this.invoke<AerolopaLayoutIndex>('layouts', {});
  }

  private async invoke<T>(
    operation: string,
    params: Record<string, string>,
    slug?: string,
  ): Promise<T> {
    const query = new URLSearchParams(params).toString();
    const url = `${this.baseUrl}/${operation}${query ? `?${query}` : ''}`;

    let response: Response;

    try {
      response = await fetchWithRetry(
        url,
        {
          headers: {
            Accept: 'application/json',
            'X-Require-Whisk-Auth': this.functionSecret,
          },
        },
        FETCH_OPTIONS,
      );
    } catch (error) {
      this.logger.error(
        `Error calling AeroLOPA provider: ${getErrorMessage(error)}`,
      );
      throw new AerolopaUnavailableError();
    }

    if (!response.ok) {
      throw await this.asDomainError(response, slug);
    }

    return (await response.json()) as T;
  }

  private async asDomainError(
    response: Response,
    slug?: string,
  ): Promise<DomainError> {
    const body = (await response
      .json()
      .catch(() => ({}))) as Partial<AerolopaErrorBody>;
    const code = body.error?.code;

    this.logger.error(
      `AeroLOPA provider returned ${response.status}: ${code ?? 'unknown'}`,
    );

    if (slug && code) {
      const SeatMapError = SEAT_MAP_ERRORS[code];

      if (SeatMapError) {
        return new SeatMapError(slug);
      }
    }

    return new AerolopaUnavailableError();
  }
}

export const AerolopaClientProvider = {
  provide: AerolopaClient,
  useFactory: (config: ConfigService) => {
    const baseUrl = config.getOrThrow<string>('AEROLOPA_FUNCTION_BASE_URL');
    const functionSecret = config.getOrThrow<string>(
      'AEROLOPA_FUNCTION_SECRET',
    );

    return new AerolopaClient(baseUrl, functionSecret);
  },
  inject: [ConfigService],
};
