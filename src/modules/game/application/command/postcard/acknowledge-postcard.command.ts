import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserPostcardsRepository } from '../../../infra/database/postcard/user-postcards.repository';
import { PostcardNotFoundError } from '../../../model/postcard/error/postcard.error';

export class AcknowledgePostcardCommand {
  constructor(
    public readonly userId: string,
    public readonly postcardId: string,
  ) {}
}

@CommandHandler(AcknowledgePostcardCommand)
export class AcknowledgePostcardHandler implements ICommandHandler<AcknowledgePostcardCommand> {
  constructor(private readonly repository: UserPostcardsRepository) {}

  async execute(command: AcknowledgePostcardCommand): Promise<void> {
    const { userId, postcardId } = command;

    const held = await this.repository.findHeld(userId, postcardId);

    if (!held) {
      throw new PostcardNotFoundError();
    }

    await this.repository.markSeen(userId, postcardId);
  }
}
