import { Module } from '@nestjs/common';
import { OperatorsService } from './service/operators.service';
import { OperatorsController } from './controller/operators.controller';
import { PrismaModule } from '../../core/provider/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OperatorsController],
  providers: [OperatorsService],
  exports: [OperatorsService],
})
export class OperatorsModule {}
