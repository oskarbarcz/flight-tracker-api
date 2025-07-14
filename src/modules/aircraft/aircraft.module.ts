import { Module } from '@nestjs/common';
import { AircraftService } from './service/aircraft.service';
import { AircraftController } from './controller/aircraft.controller';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { OperatorsModule } from '../operators/operators.module';

@Module({
  controllers: [AircraftController],
  imports: [PrismaModule, OperatorsModule],
  providers: [AircraftService],
  exports: [AircraftService],
})
export class AircraftModule {}
