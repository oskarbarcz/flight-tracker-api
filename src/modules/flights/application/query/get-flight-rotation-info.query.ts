import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { FlightsRepository } from '../../repository/flights.repository';

export interface FlightRotationInfo {
  id: string;
  rotationId: string | null;
}

export class GetFlightRotationInfoQuery extends Query<FlightRotationInfo | null> {
  constructor(public readonly flightId: string) {
    super();
  }
}

@QueryHandler(GetFlightRotationInfoQuery)
export class GetFlightRotationInfoHandler implements IQueryHandler<GetFlightRotationInfoQuery> {
  constructor(private readonly repository: FlightsRepository) {}

  async execute(
    query: GetFlightRotationInfoQuery,
  ): Promise<FlightRotationInfo | null> {
    const flight = await this.repository.findOneBy({ id: query.flightId });

    if (!flight) {
      return null;
    }

    return {
      id: flight.id,
      rotationId: flight.rotationId,
    };
  }
}
