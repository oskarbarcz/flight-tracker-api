import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChangeRequestsRepository } from '../../infra/database/change-requests.repository';
import { ChangeRequestTargets } from '../target/change-request-targets';
import {
  changesAnything,
  diffChangeRequest,
  pick,
} from '../../model/change-request.diff';
import {
  ChangeRequestChanges,
  ChangeRequestResource,
} from '../../model/change-request.model';
import {
  EmptyChangeRequestError,
  NothingToChangeError,
} from '../../model/error/change-request.error';

export class SubmitChangeRequestCommand<
  R extends ChangeRequestResource = ChangeRequestResource,
> extends Command<string> {
  constructor(
    public readonly resource: R,
    public readonly targetId: string,
    public readonly changes: ChangeRequestChanges<R>,
    public readonly requestedById: string,
  ) {
    super();
  }
}

@CommandHandler(SubmitChangeRequestCommand)
export class SubmitChangeRequestHandler implements ICommandHandler<
  SubmitChangeRequestCommand,
  string
> {
  constructor(
    private readonly repository: ChangeRequestsRepository,
    private readonly targets: ChangeRequestTargets,
  ) {}

  async execute(command: SubmitChangeRequestCommand): Promise<string> {
    return this.submit(command);
  }

  private async submit<R extends ChangeRequestResource>(
    command: SubmitChangeRequestCommand<R>,
  ): Promise<string> {
    const { resource, targetId, requestedById } = command;
    const target = this.targets.for(resource);

    const changes = pick(command.changes, target.fields);

    if (Object.keys(changes).length === 0) {
      throw new EmptyChangeRequestError();
    }

    await target.validate(targetId, changes);

    const current = await target.read(targetId);
    const diff = diffChangeRequest(target.fields, current, changes);

    if (!changesAnything(diff)) {
      throw new NothingToChangeError();
    }

    return this.repository.create({
      resource,
      targetId,
      changes,
      requestedById,
    });
  }
}
