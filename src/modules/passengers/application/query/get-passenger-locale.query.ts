import { IQueryHandler, Query, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { resolvePassengerLocale } from '../../model/passenger-name';
import { GetOperatorByIdQuery } from '../../../operators/application/query/get-operator-by-id.query';
import { Operator } from '../../../operators/model/operator.model';
import { GetAirportCountryByIataCodeQuery } from '../../../airports/application/query/get-airport-country-by-iata-code.query';

export class GetPassengerLocaleQuery extends Query<string> {
  constructor(public readonly operatorId: string) {
    super();
  }
}

@QueryHandler(GetPassengerLocaleQuery)
export class GetPassengerLocaleHandler implements IQueryHandler<GetPassengerLocaleQuery> {
  constructor(private readonly queryBus: QueryBus) {}

  async execute(query: GetPassengerLocaleQuery): Promise<string> {
    const operatorQuery = new GetOperatorByIdQuery(query.operatorId);
    const operator: Operator = await this.queryBus.execute(operatorQuery);
    const [hub] = operator.hubs;

    if (!hub) {
      return resolvePassengerLocale(null, operator.continent);
    }

    const countryQuery = new GetAirportCountryByIataCodeQuery(hub);
    const country: string | null = await this.queryBus.execute(countryQuery);

    return resolvePassengerLocale(country, operator.continent);
  }
}
