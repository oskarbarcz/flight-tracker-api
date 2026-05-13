import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { EmergencyRepository } from '../../../infra/database/repository/emergency.repository';
import { GetEmergencyResponse } from '../../../infra/http/request/emergency.dto';

export class ListFlightEmergenciesQuery extends Query<GetEmergencyResponse[]> {
  constructor(public readonly flightId: string) {
    super();
  }
}

@QueryHandler(ListFlightEmergenciesQuery)
export class ListFlightEmergenciesHandler implements IQueryHandler<ListFlightEmergenciesQuery> {
  constructor(private readonly emergencyRepository: EmergencyRepository) {}

  async execute(
    query: ListFlightEmergenciesQuery,
  ): Promise<GetEmergencyResponse[]> {
    return this.emergencyRepository.listForFlight(query.flightId);
  }
}
