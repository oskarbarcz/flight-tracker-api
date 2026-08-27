import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 } from 'uuid';
import { PostcardsRepository } from '../../../infra/database/postcard/postcards.repository';
import { PostcardClient } from '../../../../../core/provider/postcard/client/postcard.client';
import { POSTCARD_DIMENSIONS } from '../../../../../core/provider/postcard/type/postcard.types';
import {
  PostcardGeneratorTimedOutError,
  PostcardRejectedError,
} from '../../../../../core/provider/postcard/error/postcard.error';
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

    const place = findCountryOrThrow(country);
    const where = `${cityName}, ${place.name}`;

    const claimed = await this.repository.claimForCity(v4(), cityId);
    const drawing = await this.repository.startDrawing(claimed.id, v4());
    const artUuid = drawing.artUuid;

    if (drawing.reused && (await this.adopt(claimed.id, artUuid, where))) {
      return claimed.id;
    }

    try {
      const art = await this.client.generate({
        city: cityName,
        country: place.name,
        continent: continentName(place.continent),
        uuid: artUuid,
      });

      if (!art.drawn) {
        this.logger.log(
          `Postcard art for ${where} is being drawn in the background; it stays pending until ${art.key} appears`,
        );

        return claimed.id;
      }

      const { width, height } = POSTCARD_DIMENSIONS;
      await this.repository.recordArt(
        claimed.id,
        artUuid,
        art.url,
        width,
        height,
      );
    } catch (error) {
      await this.settle(claimed.id, artUuid, where, error);
    }

    return claimed.id;
  }

  private async adopt(
    id: string,
    artUuid: string,
    where: string,
  ): Promise<boolean> {
    const art = this.client.locate(artUuid);

    if (!(await this.client.confirm(art.url))) {
      return false;
    }

    const { width, height } = POSTCARD_DIMENSIONS;
    await this.repository.recordArt(id, artUuid, art.url, width, height);

    this.logger.log(
      `Postcard art for ${where} is already stored at ${art.key}, so it will not be drawn again`,
    );

    return true;
  }

  private async settle(
    id: string,
    artUuid: string,
    where: string,
    error: unknown,
  ): Promise<void> {
    if (error instanceof PostcardGeneratorTimedOutError) {
      const art = this.client.locate(artUuid);

      this.logger.warn(
        `The generator was still drawing ${where} when it was cut off, so the postcard stays pending until ${art.key} appears`,
      );

      return;
    }

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

    await this.repository.recordFailure(id, reason);
  }
}
