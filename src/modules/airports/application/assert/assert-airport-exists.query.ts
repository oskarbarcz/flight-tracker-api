import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { AirportsRepository } from '../../infra/database/airports.repository';
import { AirportNotFoundError } from '../../model/error/airport.error';

export class AssertAirportExistsQuery {
  constructor(public readonly id: string) {}
}

@QueryHandler(AssertAirportExistsQuery)
export class AssertAirportExistsHandler implements IQueryHandler<AssertAirportExistsQuery> {
  constructor(private readonly repository: AirportsRepository) {}

  async execute(query: AssertAirportExistsQuery): Promise<void> {
    const exists = await this.repository.exists(query.id);

    if (exists) return;

    throw new AirportNotFoundError();
  }
}
