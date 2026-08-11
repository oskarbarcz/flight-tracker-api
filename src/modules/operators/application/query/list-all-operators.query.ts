import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { OperatorsRepository } from '../../infra/database/repository/operators.repository';
import { Operator, OperatorServiceType } from '../../model/operator.model';

export class ListAllOperatorsQuery extends Query<Operator[]> {
  constructor(public readonly serviceType?: OperatorServiceType) {
    super();
  }
}

@QueryHandler(ListAllOperatorsQuery)
export class ListAllOperatorsHandler implements IQueryHandler<ListAllOperatorsQuery> {
  constructor(private readonly repository: OperatorsRepository) {}

  async execute(query: ListAllOperatorsQuery): Promise<Operator[]> {
    return this.repository.findAll(query.serviceType);
  }
}
