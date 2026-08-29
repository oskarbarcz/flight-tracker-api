import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 } from 'uuid';
import { PostcardsRepository } from '../../../infra/database/postcard/postcards.repository';
import { UserPostcardsRepository } from '../../../infra/database/postcard/user-postcards.repository';

export class AwardPostcardCommand {
  constructor(
    public readonly userId: string,
    public readonly cityId: string,
    public readonly awardedAt: Date,
  ) {}
}

@CommandHandler(AwardPostcardCommand)
export class AwardPostcardHandler implements ICommandHandler<AwardPostcardCommand> {
  constructor(
    private readonly postcards: PostcardsRepository,
    private readonly userPostcards: UserPostcardsRepository,
  ) {}

  async execute(command: AwardPostcardCommand): Promise<void> {
    const { userId, cityId, awardedAt } = command;

    const claimed = await this.postcards.claimForCity(v4(), cityId);

    await this.userPostcards.award(v4(), userId, claimed.id, awardedAt);
  }
}
