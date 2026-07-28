import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { AircraftRepository } from '../../infra/database/repository/aircraft.repository';

export type OperatorFleetSummary = {
  fleetSize: number;
  fleetTypes: string[];
};

export class GetOperatorFleetSummaryQuery extends Query<OperatorFleetSummary> {
  constructor(public readonly operatorId: string) {
    super();
  }
}

@QueryHandler(GetOperatorFleetSummaryQuery)
export class GetOperatorFleetSummaryHandler implements IQueryHandler<GetOperatorFleetSummaryQuery> {
  constructor(private readonly repository: AircraftRepository) {}

  async execute(
    query: GetOperatorFleetSummaryQuery,
  ): Promise<OperatorFleetSummary> {
    const [fleetSize, fleetTypes] = await Promise.all([
      this.repository.countByOperator(query.operatorId),
      this.repository.findDistinctTypesByOperator(query.operatorId),
    ]);

    return { fleetSize, fleetTypes };
  }
}
