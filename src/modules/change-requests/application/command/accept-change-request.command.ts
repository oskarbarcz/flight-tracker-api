import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainEventEmitter } from '../../../../core/domain/events/domain-event-emitter';
import { ChangeRequestWasDecidedEvent } from '../../../../core/domain/events/dto/change-request.event';
import { ChangeRequestsRepository } from '../../infra/database/change-requests.repository';
import { ChangeRequestTargets } from '../target/change-request-targets';
import { pick, touchedFields } from '../../model/change-request.diff';
import {
  ChangeRequestResource,
  ChangeRequestStatus,
  TypedChangeRequest,
} from '../../model/change-request.model';
import {
  ChangeRequestNotFoundError,
  ChangeRequestNotPendingError,
} from '../../model/error/change-request.error';

export class AcceptChangeRequestCommand {
  constructor(
    public readonly changeRequestId: string,
    public readonly decidedById: string,
  ) {}
}

@CommandHandler(AcceptChangeRequestCommand)
export class AcceptChangeRequestHandler implements ICommandHandler<AcceptChangeRequestCommand> {
  constructor(
    private readonly repository: ChangeRequestsRepository,
    private readonly targets: ChangeRequestTargets,
    private readonly domainEvents: DomainEventEmitter,
  ) {}

  async execute(command: AcceptChangeRequestCommand): Promise<void> {
    const { changeRequestId, decidedById } = command;

    const request = await this.repository.findById(changeRequestId);
    if (!request) {
      throw new ChangeRequestNotFoundError();
    }
    if (request.status !== ChangeRequestStatus.pending) {
      throw new ChangeRequestNotPendingError();
    }

    await this.accept(request, decidedById);

    const event = new ChangeRequestWasDecidedEvent({
      changeRequestId,
      resource: request.resource,
      targetId: request.targetId,
      status: ChangeRequestStatus.accepted,
      requestedById: request.requestedBy.id,
      decidedById,
    });
    this.domainEvents.emit(event);
  }

  private async accept<R extends ChangeRequestResource>(
    request: TypedChangeRequest<R>,
    decidedById: string,
  ): Promise<void> {
    const target = this.targets.for(request.resource);

    const current = await target.read(request.targetId);
    const appliedSnapshot = pick(
      current,
      touchedFields(target.fields, request.changes),
    );

    await target.apply(request.targetId, request.changes);

    const transitioned = await this.repository.transition(request.id, {
      status: ChangeRequestStatus.accepted,
      decidedById,
      appliedSnapshot,
    });
    if (!transitioned) {
      throw new ChangeRequestNotPendingError();
    }
  }
}
