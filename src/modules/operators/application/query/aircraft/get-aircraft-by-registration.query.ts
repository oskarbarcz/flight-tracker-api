import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { AircraftRepository } from '../../../infra/database/repository/aircraft.repository';
import { LegacyCreateAircraftResponse } from '../../../infra/http/request/aircraft.request';
import { AircraftWithRegistrationNotFoundError } from '../../../model/error/aircraft.error';
import { findAirframeByType } from '../../../../airframes/data/airframes';
import { AirframeNotFoundError } from '../../../../airframes/model/error/airframe.error';

export class GetAircraftByRegistrationQuery extends Query<LegacyCreateAircraftResponse> {
  constructor(public readonly registration: string) {
    super();
  }
}

@QueryHandler(GetAircraftByRegistrationQuery)
export class GetAircraftByRegistrationHandler implements IQueryHandler<GetAircraftByRegistrationQuery> {
  constructor(private readonly repository: AircraftRepository) {}

  async execute(
    query: GetAircraftByRegistrationQuery,
  ): Promise<LegacyCreateAircraftResponse> {
    const aircraft = await this.repository.legacyFindOneBy({
      registration: query.registration,
    });

    if (!aircraft) {
      throw new AircraftWithRegistrationNotFoundError();
    }

    const airframe = findAirframeByType(aircraft.type);

    if (!airframe) {
      throw new AirframeNotFoundError();
    }

    return {
      id: aircraft.id,
      airframe,
      registration: aircraft.registration,
      selcal: aircraft.selcal,
      livery: aircraft.livery,
      operator: aircraft.operator,
    };
  }
}
