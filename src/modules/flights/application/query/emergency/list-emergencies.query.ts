import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { EmergencyRepository } from '../../../infra/database/repository/emergency.repository';
import { GetEmergencyResponse } from '../../../infra/http/request/emergency.dto';

export class ListEmergenciesQuery extends Query<GetEmergencyResponse[]> {
  constructor(public readonly flightId: string) {
    super();
  }
}

@QueryHandler(ListEmergenciesQuery)
export class ListEmergenciesHandler implements IQueryHandler<ListEmergenciesQuery> {
  constructor(private readonly emergencyRepository: EmergencyRepository) {}

  async execute(query: ListEmergenciesQuery): Promise<GetEmergencyResponse[]> {
    return this.emergencyRepository.listForFlight(query.flightId);
  }
}
