import { Module } from '@nestjs/common';
import { UsersRepository } from './infra/database/repository/users.repository';
import { UsersController } from './infra/http/controller/users.controller';
import { PrismaModule } from '../../core/provider/prisma/prisma.module';
import { CheckUserExistsHandler } from './application/query/check-user-exists.query';
import { GetUserSimbriefIdHandler } from './application/query/get-user-simbrief-id.query';
import { GetUserStatsHandler } from './application/query/get-user-stats.query';
import { StatsController } from './infra/http/controller/stats.controller';

@Module({
  controllers: [UsersController, StatsController],
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
