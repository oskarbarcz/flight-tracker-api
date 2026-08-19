import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { CabinLayoutsRepository } from '../../infra/database/repository/cabin-layouts.repository';
import { CabinLayoutSuggestionList } from '../../model/cabin-layout-suggestion.model';
import { rankCabinLayoutSuggestions } from '../../model/suggestion-ranking';

export class SuggestCabinLayoutsQuery extends Query<CabinLayoutSuggestionList> {
  constructor(
    public readonly airlineIata: string | null,
    public readonly aircraftIata: string | null,
  ) {
    super();
  }
}

@QueryHandler(SuggestCabinLayoutsQuery)
export class SuggestCabinLayoutsQueryHandler implements IQueryHandler<SuggestCabinLayoutsQuery> {
  constructor(
    private readonly cabinLayoutsRepository: CabinLayoutsRepository,
  ) {}

  async execute(
    query: SuggestCabinLayoutsQuery,
  ): Promise<CabinLayoutSuggestionList> {
    const { airlineIata, aircraftIata } = query;

    const candidates = await this.cabinLayoutsRepository.findCandidates(
      airlineIata,
      aircraftIata,
    );

    const items = rankCabinLayoutSuggestions(
      candidates,
      airlineIata,
      aircraftIata,
    );

    return { items, total: items.length };
  }
}
