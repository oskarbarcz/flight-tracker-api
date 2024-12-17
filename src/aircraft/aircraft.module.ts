import { Module } from '@nestjs/common';
import { AircraftService } from './aircraft.service';
import { AircraftController } from './aircraft.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [AircraftController],
  imports: [PrismaModule],
  providers: [AircraftService],
  exports: [AircraftService],
})
export class AircraftModule {}
