import { Module } from '@nestjs/common';
import { AirportsRepository } from './infra/database/airports.repository';
import { AirportsController } from './infra/http/controller/airports.controller';
import { PrismaModule } from '../../core/provider/prisma/prisma.module';
import { CreateAirportHandler } from './application/command/create-airport.command';
import { UpdateAirportHandler } from './application/command/update-airport.command';
import { RemoveAirportHandler } from './application/command/remove-airport.command';
import { GetAirportByIdHandler } from './application/query/get-airport-by-id.query';
import { ListAllAirportsHandler } from './application/query/list-all-airports.query';
import { GetAirportByIcaoCodeHandler } from './application/query/get-airport-by-icao-code.query';
import { TerminalsRepository } from './infra/database/terminals.repository';
import { CreateTerminalHandler } from './application/command/terminals/create-terminal-command';

@Module({
  imports: [PrismaModule],
  controllers: [AirportsController],
  providers: [
    AirportsRepository,
    TerminalsRepository,
    CreateAirportHandler,
    UpdateAirportHandler,
    RemoveAirportHandler,
    GetAirportByIdHandler,
    GetAirportByIcaoCodeHandler,
    ListAllAirportsHandler,
    CreateTerminalHandler,
  ],
})
export class AirportsModule {}
