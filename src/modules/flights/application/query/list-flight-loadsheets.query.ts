import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { FlightLoadsheetsRepository } from '../../infra/database/repository/flight-loadsheets.repository';
import { FlightLoadsheet, LoadsheetKind } from '../../model/loadsheet.model';

export class ListFlightLoadsheetsQuery extends Query<FlightLoadsheet[]> {
  constructor(
    public readonly flightId: string,
    public readonly kind?: LoadsheetKind,
  ) {
    super();
  }
}

@QueryHandler(ListFlightLoadsheetsQuery)
export class ListFlightLoadsheetsHandler implements IQueryHandler<ListFlightLoadsheetsQuery> {
  constructor(private readonly repository: FlightLoadsheetsRepository) {}

  async execute(query: ListFlightLoadsheetsQuery): Promise<FlightLoadsheet[]> {
    return this.repository.listBy(query.flightId, query.kind);
  }
}
