import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { NotocRepository } from '../../infra/database/repository/notoc.repository';

export class FlightsWithNotocQuery extends Query<Set<string>> {
  constructor(public readonly flightIds: string[]) {
    super();
  }
}

@QueryHandler(FlightsWithNotocQuery)
export class FlightsWithNotocHandler implements IQueryHandler<FlightsWithNotocQuery> {
  constructor(private readonly notocRepository: NotocRepository) {}

  async execute(query: FlightsWithNotocQuery): Promise<Set<string>> {
    if (query.flightIds.length === 0) {
      return new Set();
    }

    return new Set(
      await this.notocRepository.flightIdsWithNotoc(query.flightIds),
    );
  }
}
