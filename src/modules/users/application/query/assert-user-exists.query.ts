import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../core/provider/prisma/prisma.service';
import { UserNotFoundError } from '../../model/error/user.error';

export class AssertUserExistsQuery {
  constructor(public readonly userId: string) {}
}

@QueryHandler(AssertUserExistsQuery)
export class AssertUserExistsHandler implements IQueryHandler<AssertUserExistsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: AssertUserExistsQuery): Promise<void> {
    const count = await this.prisma.user.count({
      where: { id: query.userId },
    });

    if (count === 1) {
      return;
    }

    throw new UserNotFoundError();
  }
}
