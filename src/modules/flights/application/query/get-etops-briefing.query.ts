import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { FlightsRepository } from '../../infra/database/repository/flights.repository';
import { FlightOfpNotFoundError } from '../../model/error/flight.error';
import { thresholdRingDistanceNm } from '../../model/etops-snapshot.mapper';
import { EtopsBriefing } from '../../model/etops-briefing.model';

function roundNauticalMiles(distance: number | null): number | null {
  return distance === null ? null : Math.round(distance * 100) / 100;
}

export class GetEtopsBriefingQuery extends Query<EtopsBriefing> {
  constructor(public readonly flightId: string) {
    super();
  }
}

@QueryHandler(GetEtopsBriefingQuery)
export class GetEtopsBriefingHandler implements IQueryHandler<GetEtopsBriefingQuery> {
  constructor(private readonly repository: FlightsRepository) {}

  async execute(query: GetEtopsBriefingQuery): Promise<EtopsBriefing> {
    const { flightId } = query;
    const snapshot = await this.repository.findEtopsSnapshot(flightId);

    if (!snapshot || !snapshot.hasPlan) {
      throw new FlightOfpNotFoundError();
    }

    const [route, oceanicCrossing] = await Promise.all([
      this.repository.findPlannedRoute(flightId),
      this.repository.findOceanicCrossing(flightId),
    ]);

    if (route === null || oceanicCrossing === null) {
      throw new FlightOfpNotFoundError();
    }

    return {
      etops: snapshot.isEtops
        ? {
            ruleMinutes: snapshot.rings.ruleMinutes,
            ruleRadiusNm: snapshot.rings.ruleDistanceNm,
            thresholdMinutes: snapshot.rings.thresholdMinutes,
            thresholdRadiusNm: roundNauticalMiles(
              thresholdRingDistanceNm(snapshot.rings),
            ),
            points: snapshot.points,
            airports: snapshot.airports,
          }
        : null,
      route,
      oceanicCrossing,
    };
  }
}
