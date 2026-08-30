import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { FlightLoadsheetsRepository } from '../../infra/database/repository/flight-loadsheets.repository';
import { FlightLoadsheet, LoadsheetKind } from '../../model/loadsheet.model';

export class GetCurrentLoadsheetQuery extends Query<FlightLoadsheet | null> {
  constructor(
    public readonly flightId: string,
    public readonly kind: LoadsheetKind,
  ) {
    super();
  }
}

@QueryHandler(GetCurrentLoadsheetQuery)
export class GetCurrentLoadsheetHandler implements IQueryHandler<GetCurrentLoadsheetQuery> {
  constructor(private readonly repository: FlightLoadsheetsRepository) {}

  async execute(
    query: GetCurrentLoadsheetQuery,
  ): Promise<FlightLoadsheet | null> {
    return this.repository.findCurrent(query.flightId, query.kind);
  }
}
