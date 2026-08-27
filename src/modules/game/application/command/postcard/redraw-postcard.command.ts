import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostcardsRepository } from '../../../infra/database/postcard/postcards.repository';
import {
  PostcardArtAlreadyBeingDrawnError,
  PostcardNotFoundError,
} from '../../../model/postcard/error/postcard.error';
import { PostcardStatus } from '../../../model/postcard/postcard.model';
import { GeneratePostcardCommand } from './generate-postcard.command';
import {
  PostcardFormat,
  PostcardQuality,
} from '../../../../../core/provider/postcard/type/postcard.types';
import { CommandBus } from '@nestjs/cqrs';

export class RedrawPostcardCommand {
  constructor(
    public readonly postcardId: string,
    public readonly overrides: {
      drawnName?: string;
      size?: string;
      quality?: PostcardQuality;
      format?: PostcardFormat;
    } = {},
  ) {}
}

@CommandHandler(RedrawPostcardCommand)
export class RedrawPostcardHandler implements ICommandHandler<RedrawPostcardCommand> {
  constructor(
    private readonly repository: PostcardsRepository,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: RedrawPostcardCommand): Promise<void> {
    const { postcardId, overrides } = command;

    const postcard = await this.repository.findById(postcardId);

    if (!postcard) {
      throw new PostcardNotFoundError();
    }

    if (postcard.status === PostcardStatus.Pending && postcard.artUuid) {
      throw new PostcardArtAlreadyBeingDrawnError();
    }

    const generate = new GeneratePostcardCommand(
      postcard.cityId,
      postcard.city.name,
      postcard.city.country,
      overrides,
    );
    await this.commandBus.execute(generate);
  }
}
