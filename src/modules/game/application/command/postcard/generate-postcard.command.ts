import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 } from 'uuid';
import { PostcardsRepository } from '../../../infra/database/postcard/postcards.repository';
import { PostcardClient } from '../../../../../core/provider/postcard/client/postcard.client';
import {
  PostcardFormat,
  PostcardQuality,
} from '../../../../../core/provider/postcard/type/postcard.types';
import { PostcardRejectedError } from '../../../../../core/provider/postcard/error/postcard.error';
import { findCountryOrThrow } from '../../../../countries/model/country.model';
import { getErrorMessage } from '../../../../../core/utils/error-message';

const MAX_DRAWN_WORDS = 5;

const MAX_DRAWN_LENGTH = 64;

const UNDRAWABLE_CHARACTERS = /[^\p{Script=Latin}\p{Nd} '.]/u;

export class GeneratePostcardCommand {
  constructor(
    public readonly cityId: string,
    public readonly cityName: string,
    public readonly country: string,
    public readonly overrides: {
      drawnName?: string;
      size?: string;
      quality?: PostcardQuality;
      format?: PostcardFormat;
    } = {},
  ) {}
}

@CommandHandler(GeneratePostcardCommand)
export class GeneratePostcardHandler implements ICommandHandler<GeneratePostcardCommand> {
  private readonly logger = new Logger(GeneratePostcardHandler.name);

  constructor(
    private readonly repository: PostcardsRepository,
    private readonly client: PostcardClient,
  ) {}

  async execute(command: GeneratePostcardCommand): Promise<string> {
    const { cityId, cityName, country, overrides } = command;

    const claimed = await this.repository.claimForCity(v4(), cityId);
    const artUuid = v4();

    await this.repository.startDrawing(claimed.id, artUuid);

    const city = overrides.drawnName ?? this.drawnName(cityName, country);

    try {
      const art = await this.client.generate({
        city,
        uuid: artUuid,
        size: overrides.size,
        quality: overrides.quality,
        format: overrides.format,
      });

      if (!art.confirmed) {
        this.logger.warn(
          `Postcard art for ${city} was accepted but could not be confirmed at ${art.key}`,
        );
        await this.repository.recordFailure(claimed.id);

        return claimed.id;
      }

      const [width, height] = this.dimensions(overrides.size);
      await this.repository.recordArt(
        claimed.id,
        artUuid,
        art.url,
        width,
        height,
      );
    } catch (error) {
      if (error instanceof PostcardRejectedError) {
        this.logger.error(
          `Postcard generator will not draw ${city}, so it will not be retried: ${error.message}`,
        );
      } else {
        this.logger.error(
          `Could not draw postcard for ${city}: ${getErrorMessage(error)}`,
        );
      }

      await this.repository.recordFailure(claimed.id);
    }

    return claimed.id;
  }

  private drawnName(cityName: string, country: string): string {
    const countryName = this.drawableCountry(country);

    if (!countryName) {
      return cityName;
    }

    const candidate = `${cityName} ${countryName}`;

    if (
      candidate.length > MAX_DRAWN_LENGTH ||
      candidate.trim().split(/\s+/).length > MAX_DRAWN_WORDS
    ) {
      return cityName;
    }

    return candidate;
  }

  private drawableCountry(country: string): string | null {
    const name = findCountryOrThrow(country).name.replace(/&/g, 'and');
    const withoutParenthetical = name.replace(/\s*\([^)]*\)/g, '').trim();

    if (UNDRAWABLE_CHARACTERS.test(withoutParenthetical)) {
      return null;
    }

    return withoutParenthetical;
  }

  private dimensions(size?: string): [number, number] {
    const [width, height] = (size ?? '1152x1536').split('x').map(Number);

    return [width, height];
  }
}
