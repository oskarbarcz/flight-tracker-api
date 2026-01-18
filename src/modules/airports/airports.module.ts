import { Module } from '@nestjs/common';
import { AirportsRepository } from './repository/airports.repository';
import { AirportsController } from './controller/airports.controller';
import { PrismaModule } from '../../core/provider/prisma/prisma.module';
import { CreateAirportHandler } from './application/command/create-airport.command';
import { UpdateAirportHandler } from './application/command/update-airport.command';
import { RemoveAirportHandler } from './application/command/remove-airport.command';
import { GetAirportByIdHandler } from './application/query/get-airport-by-id.query';
import { ListAllAirportsHandler } from './application/query/list-all-airports.query';

@Module({
  imports: [PrismaModule],
  controllers: [AirportsController],
  providers: [
    AirportsRepository,
    CreateAirportHandler,
    UpdateAirportHandler,
    RemoveAirportHandler,
    GetAirportByIdHandler,
    ListAllAirportsHandler,
  ],
})
export class AirportsModule {}
