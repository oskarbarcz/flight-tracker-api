import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { OperatorNotFoundError } from '../../../model/error/operator.error';
import { OperatorsRepository } from '../../../infra/database/repository/operators.repository';
import {
  AircraftAirport,
  AircraftParkingPosition,
  GetAircraftResponse,
} from '../../../infra/http/request/aircraft.request';
import { AircraftRepository } from '../../../infra/database/repository/aircraft.repository';
import { findAirframeByType } from '../../../../airframes/data/airframes';
import { AirframeNotFoundError } from '../../../../airframes/model/error/airframe.error';
import { AircraftState } from '../../../model/aircraft.model';

export class ListAllAircraftQuery extends Query<GetAircraftResponse[]> {
  constructor(public readonly operatorId: string) {
    super();
  }
}

@QueryHandler(ListAllAircraftQuery)
export class ListAllAircraftHandler implements IQueryHandler<ListAllAircraftQuery> {
  constructor(
    private readonly aircraftRepository: AircraftRepository,
    private readonly operatorsRepository: OperatorsRepository,
  ) {}

  async execute(query: ListAllAircraftQuery): Promise<GetAircraftResponse[]> {
    const operatorExists = await this.operatorsRepository.exists(
      query.operatorId,
    );

    if (!operatorExists) {
      throw new OperatorNotFoundError();
    }

    const aircrafts = await this.aircraftRepository.findAllForOperator(
      query.operatorId,
    );

    return aircrafts.map(
      ({ type, baseAirport, lastAirport, lastParkingPosition, ...rest }) => {
        const airframe = findAirframeByType(type);

        if (!airframe) {
          throw new AirframeNotFoundError();
        }

        return {
          ...rest,
          airframe,
          currentState: rest.currentState as unknown as AircraftState,
          baseAirport: baseAirport as AircraftAirport | null,
          lastAirport: lastAirport as AircraftAirport | null,
          lastParkingPosition:
            lastParkingPosition as AircraftParkingPosition | null,
        };
      },
    );
  }
}
