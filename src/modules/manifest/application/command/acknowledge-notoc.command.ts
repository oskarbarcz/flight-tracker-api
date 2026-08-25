import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotocRepository } from '../../infra/database/repository/notoc.repository';
import { NotocStageName } from '../../model/notoc.model';
import { NotocStage } from 'prisma/client/client';

export class AcknowledgeNotocCommand {
  constructor(
    public readonly flightId: string,
    public readonly stage: NotocStageName,
    public readonly actorId: string,
    public readonly acknowledgedAt: Date,
  ) {}
}

@CommandHandler(AcknowledgeNotocCommand)
export class AcknowledgeNotocHandler implements ICommandHandler<AcknowledgeNotocCommand> {
  constructor(private readonly notocRepository: NotocRepository) {}

  async execute(command: AcknowledgeNotocCommand): Promise<void> {
    const { flightId, stage, actorId, acknowledgedAt } = command;

    await this.notocRepository.acknowledge(
      flightId,
      stage as unknown as NotocStage,
      actorId,
      acknowledgedAt,
    );
  }
}
