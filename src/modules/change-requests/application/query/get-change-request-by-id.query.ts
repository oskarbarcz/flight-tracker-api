import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { ChangeRequestsRepository } from '../../infra/database/change-requests.repository';
import { ChangeRequestTargets } from '../target/change-request-targets';
import {
  diffChangeRequest,
  labelFieldChanges,
} from '../../model/change-request.diff';
import {
  ChangeRequestResource,
  ChangeRequestWithFields,
  TypedChangeRequest,
} from '../../model/change-request.model';
import {
  ChangeRequestNotFoundError,
  ChangeRequestTargetNotFoundError,
} from '../../model/error/change-request.error';

export class GetChangeRequestByIdQuery extends Query<ChangeRequestWithFields> {
  constructor(public readonly changeRequestId: string) {
    super();
  }
}

@QueryHandler(GetChangeRequestByIdQuery)
export class GetChangeRequestByIdHandler implements IQueryHandler<
  GetChangeRequestByIdQuery,
  ChangeRequestWithFields
> {
  constructor(
    private readonly repository: ChangeRequestsRepository,
    private readonly targets: ChangeRequestTargets,
  ) {}

  async execute(
    query: GetChangeRequestByIdQuery,
  ): Promise<ChangeRequestWithFields> {
    const request = await this.repository.findById(query.changeRequestId);
    if (!request) {
      throw new ChangeRequestNotFoundError();
    }

    return this.withFields(request);
  }

  private async withFields<R extends ChangeRequestResource>(
    request: TypedChangeRequest<R>,
  ): Promise<ChangeRequestWithFields> {
    const target = this.targets.for(request.resource);
    const [current, summary] = await Promise.all([
      target.read(request.targetId).catch((error) => {
        if (error instanceof ChangeRequestTargetNotFoundError) {
          return null;
        }
        throw error;
      }),
      target.describe(request.targetId, this.targets.airportSummaries()),
    ]);

    const diff = diffChangeRequest(target.fields, current, request.changes);

    return {
      ...request,
      target: summary,
      fields: await labelFieldChanges(diff, target.references),
    };
  }
}
