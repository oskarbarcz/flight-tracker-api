import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import {
  OceanicTracksErrorBody,
  OceanicTracksSet,
} from '../type/oceanic-tracks.types';
import { OceanicTracksUnavailableError } from '../error/oceanic-tracks.error';
import { getErrorMessage } from '../../../utils/error-message';
import { fetchWithRetry } from '../../http/fetch-with-retry';

const FETCH_OPTIONS = { timeoutMs: 30000, retries: 1, backoffMs: 500 };

@Injectable()
export class OceanicTracksClient {
  private readonly logger = new Logger(OceanicTracksClient.name);

  constructor(
    private readonly baseUrl: string,
    private readonly functionSecret: string,
  ) {}

  async listTracks(): Promise<OceanicTracksSet> {
    let response: Response;

    try {
      response = await fetchWithRetry(
        `${this.baseUrl}/tracks`,
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
        `Error calling oceanic tracks provider: ${getErrorMessage(error)}`,
      );
      throw new OceanicTracksUnavailableError();
    }

    if (!response.ok) {
      const body = (await response
        .json()
        .catch(() => ({}))) as Partial<OceanicTracksErrorBody>;

      this.logger.error(
        `Oceanic tracks provider returned ${response.status}: ${body.error?.code ?? 'unknown'}`,
      );
      throw new OceanicTracksUnavailableError();
    }

    return (await response.json()) as OceanicTracksSet;
  }
}

export const OceanicTracksClientProvider = {
  provide: OceanicTracksClient,
  useFactory: (config: ConfigService) => {
    const baseUrl = config.getOrThrow<string>(
      'OCEANIC_TRACKS_FUNCTION_BASE_URL',
    );
    const functionSecret = config.getOrThrow<string>(
      'OCEANIC_TRACKS_FUNCTION_SECRET',
    );

    return new OceanicTracksClient(baseUrl, functionSecret);
  },
  inject: [ConfigService],
};
