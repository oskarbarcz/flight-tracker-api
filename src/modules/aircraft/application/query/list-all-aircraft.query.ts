import { Query, QueryHandler, IQueryHandler, QueryBus } from '@nestjs/cqrs';
import { AssertOperatorExistsQuery } from '../../../operators/application/assert/assert-operator-exists.query';
import {
  AircraftAirport,
  AircraftParkingPosition,
  GetAircraftResponse,
} from '../../infra/http/request/aircraft.request';
import { AircraftRepository } from '../../infra/database/repository/aircraft.repository';
import { findAirframeByType } from '../../../airframes/data/airframes';
import { AirframeNotFoundError } from '../../../airframes/model/error/airframe.error';
import { AircraftState } from '../../model/aircraft.model';
import { toAircraftCabinLayout } from '../../model/cabin-layout-assignment';

export class ListAllAircraftQuery extends Query<GetAircraftResponse[]> {
  constructor(public readonly operatorId: string) {
    super();
  }
}

@QueryHandler(ListAllAircraftQuery)
export class ListAllAircraftHandler implements IQueryHandler<ListAllAircraftQuery> {
  constructor(
    private readonly aircraftRepository: AircraftRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(query: ListAllAircraftQuery): Promise<GetAircraftResponse[]> {
    const operatorQuery = new AssertOperatorExistsQuery(query.operatorId);
    await this.queryBus.execute(operatorQuery);

    const aircrafts = await this.aircraftRepository.findAllForOperator(
      query.operatorId,
    );

    return aircrafts.map(
      ({
        type,
        baseAirport,
        lastAirport,
        lastParkingPosition,
        operator,
        layout,
        ...rest
      }) => {
        const airframe = findAirframeByType(type);

        if (!airframe) {
          throw new AirframeNotFoundError();
        }

        return {
          ...rest,
          airframe,
          currentState: rest.currentState as unknown as AircraftState,
          cabinLayout: toAircraftCabinLayout(
            layout,
            operator?.iataCode ?? null,
            airframe.iataType,
          ),
          baseAirport: baseAirport as AircraftAirport | null,
          lastAirport: lastAirport as AircraftAirport | null,
          lastParkingPosition:
            lastParkingPosition as AircraftParkingPosition | null,
        };
      },
    );
  }
}
