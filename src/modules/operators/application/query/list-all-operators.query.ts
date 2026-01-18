import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { OperatorsRepository } from '../../repository/operators.repository';
import { Operator } from '../../entity/operator.entity';

export class ListAllOperatorsQuery extends Query<Operator[]> {
  constructor() {
    super();
  }
}

@QueryHandler(ListAllOperatorsQuery)
export class ListAllOperatorsHandler implements IQueryHandler<ListAllOperatorsQuery> {
  constructor(private readonly repository: OperatorsRepository) {}

  async execute(): Promise<Operator[]> {
    return this.repository.findAll();
  }
}
