import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { Airframe } from '../../model/airframe.model';
import { findAirframeByType } from '../../data/airframes';
import { AirframeNotFoundError } from '../../model/error/airframe.error';

export class GetAirframeByTypeQuery extends Query<Airframe> {
  constructor(public readonly type: string) {
    super();
  }
}

@QueryHandler(GetAirframeByTypeQuery)
export class GetAirframeByTypeHandler implements IQueryHandler<GetAirframeByTypeQuery> {
  async execute(query: GetAirframeByTypeQuery): Promise<Airframe> {
    const airframe = findAirframeByType(query.type);

    if (!airframe) {
      throw new AirframeNotFoundError();
    }

    return airframe;
  }
}
