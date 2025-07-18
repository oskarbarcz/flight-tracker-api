import { Module } from '@nestjs/common';
import { AirportsRepository } from './repository/airports.repository';
import { AirportsController } from './controller/airports.controller';
import { PrismaModule } from '../../core/provider/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AirportsController],
  providers: [AirportsRepository],
})
export class AirportsModule {}
