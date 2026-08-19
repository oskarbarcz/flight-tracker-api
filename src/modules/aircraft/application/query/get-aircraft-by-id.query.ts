import { Query, QueryHandler, IQueryHandler, QueryBus } from '@nestjs/cqrs';
import {
  AircraftAirport,
  AircraftParkingPosition,
  GetAircraftResponse,
} from '../../infra/http/request/aircraft.request';
import { AircraftRepository } from '../../infra/database/repository/aircraft.repository';
import { AircraftNotFoundError } from '../../model/error/aircraft.error';
import { AssertOperatorExistsQuery } from '../../../operators/application/assert/assert-operator-exists.query';
import { findAirframeByType } from '../../../airframes/data/airframes';
import { AirframeNotFoundError } from '../../../airframes/model/error/airframe.error';
import { AircraftState } from '../../model/aircraft.model';
import { toAircraftCabinLayout } from '../../model/cabin-layout-assignment';

export class GetAircraftByIdQuery extends Query<GetAircraftResponse> {
  constructor(
    public readonly operatorId: string,
    public readonly aircraftId: string,
  ) {
    super();
  }
}

@QueryHandler(GetAircraftByIdQuery)
export class GetAircraftByIdHandler implements IQueryHandler<GetAircraftByIdQuery> {
  constructor(
    private readonly aircraftRepository: AircraftRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(query: GetAircraftByIdQuery): Promise<GetAircraftResponse> {
    const operatorQuery = new AssertOperatorExistsQuery(query.operatorId);
    await this.queryBus.execute(operatorQuery);

    const aircraft = await this.aircraftRepository.findOneBy({
      id: query.aircraftId,
      operatorId: query.operatorId,
    });

    if (!aircraft) {
      throw new AircraftNotFoundError();
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
      currentState: aircraft.currentState as unknown as AircraftState,
      etopsThresholdMinutes: aircraft.etopsThresholdMinutes,
      cabinLayout: toAircraftCabinLayout(
        aircraft.layout,
        aircraft.operator?.iataCode ?? null,
        airframe.iataType,
      ),
      baseAirport: aircraft.baseAirport as AircraftAirport | null,
      lastAirport: aircraft.lastAirport as AircraftAirport | null,
      lastAirportUpdatedAt: aircraft.lastAirportUpdatedAt,
      lastParkingPosition:
        aircraft.lastParkingPosition as AircraftParkingPosition | null,
    };
  }
}
