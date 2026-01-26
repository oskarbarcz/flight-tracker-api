import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../../core/provider/prisma/prisma.module';
import { CheckUserExistsHandler } from './application/query/check-user-exists.query';
import { GetUserSimbriefIdHandler } from './application/query/get-user-simbrief-id.query';

@Module({
  controllers: [UsersController],
  providers: [UsersService, CheckUserExistsHandler, GetUserSimbriefIdHandler],
  imports: [PrismaModule],
  exports: [UsersService],
})
export class UsersModule {}
