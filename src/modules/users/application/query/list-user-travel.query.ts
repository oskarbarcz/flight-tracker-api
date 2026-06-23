import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { UserTravel } from '../../model/user-travel.model';
import { UserTravelRepository } from '../../infra/database/repository/user-travel.repository';

export class ListUserTravelQuery extends Query<UserTravel[]> {
  constructor(public readonly userId: string) {
    super();
  }
}

@QueryHandler(ListUserTravelQuery)
export class ListUserTravelHandler implements IQueryHandler<ListUserTravelQuery> {
  constructor(private readonly travelRepository: UserTravelRepository) {}

  async execute(query: ListUserTravelQuery): Promise<UserTravel[]> {
    return this.travelRepository.findByUser(query.userId);
  }
}
