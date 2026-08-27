import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  PostcardAwaitingArt,
  PostcardsRepository,
} from '../../../infra/database/postcard/postcards.repository';
import { PostcardClient } from '../../../../../core/provider/postcard/client/postcard.client';
import { POSTCARD_DIMENSIONS } from '../../../../../core/provider/postcard/type/postcard.types';

const ART_DEADLINE_MS = 15 * 60 * 1000;

export class ConfirmDrawnPostcardsCommand {}

@CommandHandler(ConfirmDrawnPostcardsCommand)
export class ConfirmDrawnPostcardsHandler implements ICommandHandler<ConfirmDrawnPostcardsCommand> {
  private readonly logger = new Logger(ConfirmDrawnPostcardsHandler.name);

  constructor(
    private readonly repository: PostcardsRepository,
    private readonly client: PostcardClient,
  ) {}

  async execute(): Promise<void> {
    const awaiting = await this.repository.listAwaitingArt();

    for (const postcard of awaiting) {
      await this.settle(postcard);
    }
  }

  private async settle(postcard: PostcardAwaitingArt): Promise<void> {
    const where = `${postcard.city.name}, ${postcard.city.country}`;
    const art = this.client.locate(postcard.artUuid);

    if (await this.client.confirm(art.url)) {
      const { width, height } = POSTCARD_DIMENSIONS;

      await this.repository.recordArt(
        postcard.id,
        postcard.artUuid,
        art.url,
        width,
        height,
      );

      this.logger.log(`Postcard art for ${where} arrived at ${art.key}`);

      return;
    }

    if (Date.now() - postcard.startedAt.getTime() < ART_DEADLINE_MS) {
      return;
    }

    const reason = `The generator took the art but never delivered it to ${art.key}`;

    this.logger.warn(`Giving up on the postcard art for ${where}: ${reason}`);
    await this.repository.recordFailure(postcard.id, reason);
  }
}
