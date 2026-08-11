import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { OperatorsRepository } from '../../infra/database/repository/operators.repository';
import { Operator, OperatorServiceType } from '../../model/operator.model';

export const RECENT_OPERATORS_LIMIT = 4;

export class ListRecentOperatorsQuery extends Query<Operator[]> {
  constructor(
    public readonly userId: string,
    public readonly serviceType?: OperatorServiceType,
  ) {
    super();
  }
}

@QueryHandler(ListRecentOperatorsQuery)
export class ListRecentOperatorsHandler implements IQueryHandler<ListRecentOperatorsQuery> {
  constructor(private readonly repository: OperatorsRepository) {}

  async execute(query: ListRecentOperatorsQuery): Promise<Operator[]> {
    return this.repository.findRecentlyInvolvedWith(
      query.userId,
      RECENT_OPERATORS_LIMIT,
      query.serviceType,
    );
  }
}
