import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainEventEmitter } from '../../../../core/domain/events/domain-event-emitter';
import { ChangeRequestWasDecidedEvent } from '../../../../core/domain/events/dto/change-request.event';
import { ChangeRequestsRepository } from '../../infra/database/change-requests.repository';
import { ChangeRequestStatus } from '../../model/change-request.model';
import {
  ChangeRequestNotFoundError,
  ChangeRequestNotPendingError,
} from '../../model/error/change-request.error';

export class RejectChangeRequestCommand {
  constructor(
    public readonly changeRequestId: string,
    public readonly decidedById: string,
    public readonly rejectionReason: string,
  ) {}
}

@CommandHandler(RejectChangeRequestCommand)
export class RejectChangeRequestHandler implements ICommandHandler<RejectChangeRequestCommand> {
  constructor(
    private readonly repository: ChangeRequestsRepository,
    private readonly domainEvents: DomainEventEmitter,
  ) {}

  async execute(command: RejectChangeRequestCommand): Promise<void> {
    const { changeRequestId, decidedById, rejectionReason } = command;

    const request = await this.repository.findById(changeRequestId);
    if (!request) {
      throw new ChangeRequestNotFoundError();
    }

    const transitioned = await this.repository.transition(changeRequestId, {
      status: ChangeRequestStatus.rejected,
      decidedById,
      rejectionReason,
    });
    if (!transitioned) {
      throw new ChangeRequestNotPendingError();
    }

    const event = new ChangeRequestWasDecidedEvent({
      changeRequestId,
      resource: request.resource,
      targetId: request.targetId,
      status: ChangeRequestStatus.rejected,
      requestedById: request.requestedBy.id,
      decidedById,
    });
    this.domainEvents.emit(event);
  }
}
