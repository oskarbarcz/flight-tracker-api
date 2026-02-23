import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { OperatorsRepository } from '../../repository/operators.repository';
import { Operator } from '../../model/operator.model';
import { OperatorWithIcaoCodeNotFoundError } from '../../model/error/operator.error';

export class GetOperatorByIcaoCodeQuery extends Query<Operator> {
  constructor(public readonly icaoCode: string) {
    super();
  }
}

@QueryHandler(GetOperatorByIcaoCodeQuery)
export class GetOperatorByIcaoCodeHandler implements IQueryHandler<GetOperatorByIcaoCodeQuery> {
  constructor(private readonly repository: OperatorsRepository) {}

  async execute(query: GetOperatorByIcaoCodeQuery): Promise<Operator> {
    const operator = await this.repository.findOneBy({
      icaoCode: query.icaoCode,
    });

    if (!operator) {
      throw new OperatorWithIcaoCodeNotFoundError();
    }

    return operator;
  }
}
