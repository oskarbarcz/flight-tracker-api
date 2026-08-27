import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { PostcardsRepository } from '../../../infra/database/postcard/postcards.repository';

export class GetCityIdsWithPostcardQuery extends Query<string[]> {}

@QueryHandler(GetCityIdsWithPostcardQuery)
export class GetCityIdsWithPostcardHandler implements IQueryHandler<GetCityIdsWithPostcardQuery> {
  constructor(private readonly repository: PostcardsRepository) {}

  async execute(): Promise<string[]> {
    return this.repository.listCityIdsWithPostcard();
  }
}
