import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 } from 'uuid';
import { PostcardsRepository } from '../../../infra/database/postcard/postcards.repository';
import { PostcardClient } from '../../../../../core/provider/postcard/client/postcard.client';
import { POSTCARD_DEFAULTS } from '../../../../../core/provider/postcard/type/postcard.types';
import { PostcardRejectedError } from '../../../../../core/provider/postcard/error/postcard.error';
import {
  continentName,
  findCountryOrThrow,
} from '../../../../countries/model/country.model';
import { getErrorMessage } from '../../../../../core/utils/error-message';

export class GeneratePostcardCommand {
  constructor(
    public readonly cityId: string,
    public readonly cityName: string,
    public readonly country: string,
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
    const { cityId, cityName, country } = command;

    const claimed = await this.repository.claimForCity(v4(), cityId);
    const artUuid = v4();
    const place = findCountryOrThrow(country);
    const where = `${cityName}, ${place.name}`;

    await this.repository.startDrawing(claimed.id, artUuid);

    try {
      const art = await this.client.generate({
        city: cityName,
        country: place.name,
        continent: continentName(place.continent),
        uuid: artUuid,
      });

      if (!art.confirmed) {
        const reason = `The art was accepted but could not be confirmed at ${art.key}`;
        this.logger.warn(`Postcard art for ${where}: ${reason}`);
        await this.repository.recordFailure(claimed.id, reason);

        return claimed.id;
      }

      const [width, height] = this.dimensions();
      await this.repository.recordArt(
        claimed.id,
        artUuid,
        art.url,
        width,
        height,
      );
    } catch (error) {
      let reason: string;

      if (error instanceof PostcardRejectedError) {
        reason = `The generator will not draw "${where}": ${error.message}`;
        this.logger.error(
          `Postcard generator will not draw ${where}, so it will not be retried: ${error.message}`,
        );
      } else {
        reason = getErrorMessage(error);
        this.logger.error(`Could not draw postcard for ${where}: ${reason}`);
      }

      await this.repository.recordFailure(claimed.id, reason);
    }

    return claimed.id;
  }

  private dimensions(): [number, number] {
    const [width, height] = POSTCARD_DEFAULTS.size.split('x').map(Number);

    return [width, height];
  }
}
