import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { UserPostcardsRepository } from '../../../infra/database/postcard/user-postcards.repository';
import { MyPostcard } from '../../../model/postcard/postcard.model';
import { PostcardNotFoundError } from '../../../model/postcard/error/postcard.error';
import { toCountryRef } from '../../../../countries/model/country.model';

export class GetMyPostcardQuery extends Query<MyPostcard> {
  constructor(
    public readonly userId: string,
    public readonly postcardId: string,
  ) {
    super();
  }
}

@QueryHandler(GetMyPostcardQuery)
export class GetMyPostcardHandler implements IQueryHandler<GetMyPostcardQuery> {
  constructor(private readonly repository: UserPostcardsRepository) {}

  async execute(query: GetMyPostcardQuery): Promise<MyPostcard> {
    const held = await this.repository.findHeld(query.userId, query.postcardId);

    if (!held) {
      throw new PostcardNotFoundError();
    }

    return {
      id: held.postcard.id,
      city: { id: held.postcard.city.id, name: held.postcard.city.name },
      country: toCountryRef(held.postcard.city.country),
      imageUrl: held.postcard.imageUrl,
      width: held.postcard.width,
      height: held.postcard.height,
      status: held.postcard.status,
      awardedAt: held.awardedAt,
      seenAt: held.seenAt,
    };
  }
}
