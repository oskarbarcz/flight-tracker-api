import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../core/provider/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

export class GetUserSimbriefIdQuery extends Query<string | null> {
  constructor(public readonly userId: string) {
    super();
  }
}

@QueryHandler(GetUserSimbriefIdQuery)
export class GetUserSimbriefIdHandler implements IQueryHandler<GetUserSimbriefIdQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetUserSimbriefIdQuery): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: query.userId },
    });

    if (!user) {
      throw new NotFoundException('User with given ID not found');
    }
    return user.simbriefUserId;
  }
}
