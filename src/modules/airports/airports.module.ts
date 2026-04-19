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
import { TerminalsController } from './infra/http/controller/terminals.controller';
import { CreateTerminalHandler } from './application/command/terminals/create-terminal.command';
import { UpdateTerminalHandler } from './application/command/terminals/update-terminal.command';
import { RemoveTerminalHandler } from './application/command/terminals/remove-terminal.command';
import { GetTerminalByIdHandler } from './application/query/get-terminal-by-id.query';
import { ListTerminalsByAirportHandler } from './application/query/list-terminals-by-airport.query';

@Module({
  imports: [PrismaModule],
  controllers: [AirportsController, TerminalsController],
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
    UpdateTerminalHandler,
    RemoveTerminalHandler,
    GetTerminalByIdHandler,
    ListTerminalsByAirportHandler,
  ],
})
export class AirportsModule {}
