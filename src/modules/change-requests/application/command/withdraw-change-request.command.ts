import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChangeRequestsRepository } from '../../infra/database/change-requests.repository';
import { ChangeRequestStatus } from '../../model/change-request.model';
import {
  ChangeRequestNotFoundError,
  ChangeRequestNotPendingError,
  NotChangeRequestOwnerError,
} from '../../model/error/change-request.error';

export class WithdrawChangeRequestCommand {
  constructor(
    public readonly changeRequestId: string,
    public readonly userId: string,
  ) {}
}

@CommandHandler(WithdrawChangeRequestCommand)
export class WithdrawChangeRequestHandler implements ICommandHandler<WithdrawChangeRequestCommand> {
  constructor(private readonly repository: ChangeRequestsRepository) {}

  async execute(command: WithdrawChangeRequestCommand): Promise<void> {
    const { changeRequestId, userId } = command;

    const request = await this.repository.findById(changeRequestId);
    if (!request) {
      throw new ChangeRequestNotFoundError();
    }
    if (request.requestedBy.id !== userId) {
      throw new NotChangeRequestOwnerError();
    }

    const transitioned = await this.repository.transition(changeRequestId, {
      status: ChangeRequestStatus.withdrawn,
    });
    if (!transitioned) {
      throw new ChangeRequestNotPendingError();
    }
  }
}
