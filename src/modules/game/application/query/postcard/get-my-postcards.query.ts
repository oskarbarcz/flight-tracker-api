import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { UserPostcardsRepository } from '../../../infra/database/postcard/user-postcards.repository';
import { PostcardsRepository } from '../../../infra/database/postcard/postcards.repository';
import { GetMyPostcardsResponse } from '../../../model/postcard/postcard.model';
import { toCountryRef } from '../../../../countries/model/country.model';

export class GetMyPostcardsQuery extends Query<GetMyPostcardsResponse> {
  constructor(public readonly userId: string) {
    super();
  }
}

@QueryHandler(GetMyPostcardsQuery)
export class GetMyPostcardsHandler implements IQueryHandler<GetMyPostcardsQuery> {
  constructor(
    private readonly userPostcards: UserPostcardsRepository,
    private readonly postcards: PostcardsRepository,
  ) {}

  async execute(query: GetMyPostcardsQuery): Promise<GetMyPostcardsResponse> {
    const held = await this.userPostcards.listForUser(query.userId);
    const total = await this.postcards.count();

    return {
      postcards: held.map((entry) => ({
        id: entry.postcard.id,
        city: { id: entry.postcard.city.id, name: entry.postcard.city.name },
        country: toCountryRef(entry.postcard.city.country),
        imageUrl: entry.postcard.imageUrl,
        width: entry.postcard.width,
        height: entry.postcard.height,
        status: entry.postcard.status,
        awardedAt: entry.awardedAt,
        seenAt: entry.seenAt,
      })),
      total,
    };
  }
}
