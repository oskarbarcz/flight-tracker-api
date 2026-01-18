import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../core/provider/prisma/prisma.service';

export class CheckUserExistsQuery extends Query<boolean> {
  constructor(public readonly userId: string) {
    super();
  }
}

@QueryHandler(CheckUserExistsQuery)
export class CheckUserExistsHandler implements IQueryHandler<CheckUserExistsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: CheckUserExistsQuery): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { id: query.userId },
    });
    return count === 1;
  }
}
