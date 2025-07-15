import { Module } from '@nestjs/common';
import { AirportsService } from './service/airports.service';
import { AirportsController } from './controller/airports.controller';
import { PrismaModule } from '../../core/provider/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AirportsController],
  providers: [AirportsService],
  exports: [AirportsService],
})
export class AirportsModule {}
