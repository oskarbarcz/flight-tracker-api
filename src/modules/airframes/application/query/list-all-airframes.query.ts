import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { Airframe } from '../../model/airframe.model';
import { AIRFRAMES } from '../../data/airframes';

export class ListAllAirframesQuery extends Query<Airframe[]> {}

@QueryHandler(ListAllAirframesQuery)
export class ListAllAirframesHandler implements IQueryHandler<ListAllAirframesQuery> {
  async execute(): Promise<Airframe[]> {
    return [...AIRFRAMES];
  }
}
