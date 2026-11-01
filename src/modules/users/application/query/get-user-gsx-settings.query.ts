import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infra/database/repository/users.repository';
import { GsxSettings } from '../../model/gsx-settings.model';

export class GetUserGsxSettingsQuery extends Query<GsxSettings> {
  constructor(public readonly userId: string) {
    super();
  }
}

@QueryHandler(GetUserGsxSettingsQuery)
export class GetUserGsxSettingsHandler implements IQueryHandler<GetUserGsxSettingsQuery> {
  constructor(private readonly repository: UsersRepository) {}

  async execute(query: GetUserGsxSettingsQuery): Promise<GsxSettings> {
    return this.repository.getGsxSettings(query.userId);
  }
}
