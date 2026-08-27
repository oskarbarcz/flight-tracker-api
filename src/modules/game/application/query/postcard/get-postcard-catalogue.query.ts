import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { PostcardsRepository } from '../../../infra/database/postcard/postcards.repository';
import { GetPostcardCatalogueResponse } from '../../../model/postcard/postcard.model';
import { toCountryRef } from '../../../../countries/model/country.model';

export class GetPostcardCatalogueQuery extends Query<GetPostcardCatalogueResponse> {}

@QueryHandler(GetPostcardCatalogueQuery)
export class GetPostcardCatalogueHandler implements IQueryHandler<GetPostcardCatalogueQuery> {
  constructor(private readonly repository: PostcardsRepository) {}

  async execute(): Promise<GetPostcardCatalogueResponse> {
    const postcards = await this.repository.listCatalogue();

    return {
      postcards: postcards.map((postcard) => ({
        id: postcard.id,
        city: { id: postcard.city.id, name: postcard.city.name },
        country: toCountryRef(postcard.city.country),
        imageUrl: postcard.imageUrl,
        width: postcard.width,
        height: postcard.height,
        status: postcard.status,
        heldBy: postcard.heldBy,
      })),
    };
  }
}
