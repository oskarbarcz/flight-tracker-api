import { IQueryHandler, Query, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { AircraftRepository } from '../../infra/database/repository/aircraft.repository';
import { AssertOperatorExistsQuery } from '../../../operators/application/assert/assert-operator-exists.query';
import { AircraftNotFoundError } from '../../model/error/aircraft.error';
import { findAirframeByType } from '../../../airframes/data/airframes';
import { AirframeNotFoundError } from '../../../airframes/model/error/airframe.error';
import { SuggestCabinLayoutsQuery } from '../../../cabin-layouts/application/query/suggest-cabin-layouts.query';
import { CabinLayoutSuggestionList } from '../../../cabin-layouts/model/cabin-layout-suggestion.model';

export class SuggestAircraftCabinLayoutsQuery extends Query<CabinLayoutSuggestionList> {
  constructor(
    public readonly operatorId: string,
    public readonly aircraftId: string,
  ) {
    super();
  }
}

@QueryHandler(SuggestAircraftCabinLayoutsQuery)
export class SuggestAircraftCabinLayoutsHandler implements IQueryHandler<SuggestAircraftCabinLayoutsQuery> {
  constructor(
    private readonly aircraftRepository: AircraftRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(
    query: SuggestAircraftCabinLayoutsQuery,
  ): Promise<CabinLayoutSuggestionList> {
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

    const suggestionsQuery = new SuggestCabinLayoutsQuery(
      aircraft.operator?.iataCode ?? null,
      airframe.iataType,
    );

    return this.queryBus.execute(suggestionsQuery);
  }
}
