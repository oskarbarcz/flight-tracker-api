import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import {
  POSTCARD_DEFAULTS,
  POSTCARD_FILE_EXTENSION,
  POSTCARD_KEY_PREFIX,
  PostcardArt,
  PostcardErrorBody,
  PostcardFormat,
  PostcardGeneratedBody,
  PostcardRequest,
} from '../type/postcard.types';
import {
  PostcardGeneratorUnavailableError,
  PostcardRejectedError,
} from '../error/postcard.error';
import { getErrorMessage } from '../../../utils/error-message';
import { fetchWithRetry } from '../../http/fetch-with-retry';

const FETCH_OPTIONS = { timeoutMs: 120000, retries: 0, backoffMs: 0 };

const CONFIRM_OPTIONS = { timeoutMs: 10000, retries: 1, backoffMs: 500 };

const ACCEPTED_WITHOUT_RESULT = 202;

@Injectable()
export class PostcardClient {
  private readonly logger = new Logger(PostcardClient.name);

  constructor(
    private readonly baseUrl: string,
    private readonly functionSecret: string,
    private readonly artBaseUrl: string,
  ) {}

  async generate(request: PostcardRequest): Promise<PostcardArt> {
    const expected = this.locate(request.uuid);

    const query = new URLSearchParams({
      city: request.city,
      country: request.country,
      continent: request.continent,
      uuid: request.uuid,
      size: POSTCARD_DEFAULTS.size,
      quality: POSTCARD_DEFAULTS.quality,
      format: POSTCARD_DEFAULTS.format,
    }).toString();

    let response: Response;

    try {
      response = await fetchWithRetry(
        `${this.baseUrl}/city?${query}`,
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
        `Error calling postcard generator: ${getErrorMessage(error)}`,
      );
      throw new PostcardGeneratorUnavailableError();
    }

    if (response.status === ACCEPTED_WITHOUT_RESULT) {
      this.logger.log(
        `Postcard generation for ${request.city}, ${request.country} outlived the synchronous window; confirming ${expected.key}`,
      );

      return { ...expected, confirmed: await this.confirm(expected.url) };
    }

    if (!response.ok) {
      throw await this.asDomainError(response);
    }

    const body = (await response.json()) as PostcardGeneratedBody;

    return { key: body.key, url: body.url, confirmed: true };
  }

  async confirm(url: string): Promise<boolean> {
    try {
      const response = await fetchWithRetry(
        url,
        { method: 'HEAD' },
        CONFIRM_OPTIONS,
      );

      return response.ok;
    } catch (error) {
      this.logger.warn(
        `Could not confirm stored postcard art: ${getErrorMessage(error)}`,
      );

      return false;
    }
  }

  locate(
    uuid: string,
    format: PostcardFormat = POSTCARD_DEFAULTS.format,
  ): Omit<PostcardArt, 'confirmed'> {
    const key = `${POSTCARD_KEY_PREFIX}/${uuid}.${POSTCARD_FILE_EXTENSION[format]}`;

    return { key, url: `${this.artBaseUrl}/${key}` };
  }

  private async asDomainError(response: Response): Promise<Error> {
    const body = (await response
      .json()
      .catch(() => ({}))) as Partial<PostcardErrorBody>;

    this.logger.error(
      `Postcard generator returned ${response.status}: ${body.error?.code ?? 'unknown'}`,
    );

    if (body.error?.code === 'BAD_REQUEST') {
      return new PostcardRejectedError(body.error.message);
    }

    return new PostcardGeneratorUnavailableError();
  }
}

export const PostcardClientProvider = {
  provide: PostcardClient,
  useFactory: (config: ConfigService) => {
    const baseUrl = config.getOrThrow<string>('POSTCARD_FUNCTION_BASE_URL');
    const functionSecret = config.getOrThrow<string>(
      'POSTCARD_FUNCTION_SECRET',
    );
    const artBaseUrl = config.getOrThrow<string>('POSTCARD_ART_BASE_URL');

    return new PostcardClient(baseUrl, functionSecret, artBaseUrl);
  },
  inject: [ConfigService],
};
