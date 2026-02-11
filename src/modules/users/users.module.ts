import { Module } from '@nestjs/common';
import { UsersRepository } from './repository/users.repository';
import { UsersController } from './controller/users.controller';
import { PrismaModule } from '../../core/provider/prisma/prisma.module';
import { CheckUserExistsHandler } from './application/query/check-user-exists.query';
import { GetUserSimbriefIdHandler } from './application/query/get-user-simbrief-id.query';
import { GetUserStatsHandler } from './application/query/get-user-stats.query';
import { UserStatsController } from './controller/user-stats.controller';

@Module({
  controllers: [UsersController, UserStatsController],
  providers: [
    UsersRepository,
    CheckUserExistsHandler,
    GetUserSimbriefIdHandler,
    GetUserStatsHandler,
  ],
  imports: [PrismaModule],
  exports: [UsersRepository],
})
export class UsersModule {}
