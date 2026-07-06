import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { UserAircraftEntry } from '../../model/user-aircraft.model';
import { UserAircraftRepository } from '../../infra/database/repository/user-aircraft.repository';

export class ListUserAircraftQuery extends Query<UserAircraftEntry[]> {
  constructor(public readonly userId: string) {
    super();
  }
}

@QueryHandler(ListUserAircraftQuery)
export class ListUserAircraftHandler implements IQueryHandler<ListUserAircraftQuery> {
  constructor(
    private readonly userAircraftRepository: UserAircraftRepository,
  ) {}

  execute(query: ListUserAircraftQuery): Promise<UserAircraftEntry[]> {
    return this.userAircraftRepository.findByUser(query.userId);
  }
}
