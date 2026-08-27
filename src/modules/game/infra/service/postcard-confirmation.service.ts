import { Injectable, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfirmDrawnPostcardsCommand } from '../../application/command/postcard/confirm-drawn-postcards.command';
import { getErrorMessage } from '../../../../core/utils/error-message';

@Injectable()
export class PostcardConfirmationService {
  private readonly logger = new Logger(PostcardConfirmationService.name);

  constructor(private readonly commandBus: CommandBus) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async confirmDrawnPostcards(): Promise<void> {
    try {
      const command = new ConfirmDrawnPostcardsCommand();
      await this.commandBus.execute(command);
    } catch (error) {
      this.logger.error(
        `Scheduled postcard confirmation failed: ${getErrorMessage(error)}`,
      );
    }
  }
}
