import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import {
  OsmAirportData,
  OsmAirportResponse,
  OsmErrorBody,
  OsmErrorCode,
  OsmSection,
} from '../type/osm.types';
import {
  AerodromeNotFoundError,
  AirportDataTooLargeError,
  OsmProviderUnavailableError,
} from '../error/osm.error';
import { DomainError } from '../../../errors/domain-error';
import { getErrorMessage } from '../../../utils/error-message';
import { fetchWithRetry } from '../../http/fetch-with-retry';

const FETCH_OPTIONS = { timeoutMs: 60000, retries: 0 };

const ICAO_ERRORS: Partial<
  Record<OsmErrorCode, new (icaoCode: string) => DomainError>
> = {
  AERODROME_NOT_FOUND: AerodromeNotFoundError,
  RESULT_TOO_LARGE: AirportDataTooLargeError,
};

@Injectable()
export class OsmClient {
  private readonly logger = new Logger(OsmClient.name);

  constructor(
    private readonly baseUrl: string,
    private readonly functionSecret: string,
  ) {}

  async pullAirport(
    icaoCode: string,
    sections?: OsmSection[],
  ): Promise<OsmAirportData> {
    const icao = icaoCode.toUpperCase();
    const params: Record<string, string> = { icao };

    if (sections?.length) {
      params.include = sections.join(',');
    }

    const body = await this.invoke<OsmAirportResponse>('pull', params, icao);

    return body.airport;
  }

  private async invoke<T>(
    operation: string,
    params: Record<string, string>,
    icaoCode: string,
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
        `Error calling OpenStreetMap provider: ${getErrorMessage(error)}`,
      );
      throw new OsmProviderUnavailableError();
    }

    if (!response.ok) {
      throw await this.asDomainError(response, icaoCode);
    }

    return (await response.json()) as T;
  }

  private async asDomainError(
    response: Response,
    icaoCode: string,
  ): Promise<DomainError> {
    const body = (await response
      .json()
      .catch(() => ({}))) as Partial<OsmErrorBody>;
    const code = body.error?.code;

    this.logger.error(
      `OpenStreetMap provider returned ${response.status}: ${code ?? 'unknown'}`,
    );

    if (code) {
      const IcaoError = ICAO_ERRORS[code];

      if (IcaoError) {
        return new IcaoError(icaoCode);
      }
    }

    return new OsmProviderUnavailableError();
  }
}

export const OsmClientProvider = {
  provide: OsmClient,
  useFactory: (config: ConfigService) => {
    const baseUrl = config.getOrThrow<string>('OSM_FUNCTION_BASE_URL');
    const functionSecret = config.getOrThrow<string>('OSM_FUNCTION_SECRET');

    return new OsmClient(baseUrl, functionSecret);
  },
  inject: [ConfigService],
};
