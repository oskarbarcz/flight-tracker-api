import { Module } from '@nestjs/common';
import { AircraftController } from './controller/aircraft.controller';
import { PrismaModule } from '../../core/provider/prisma/prisma.module';
import { AircraftRepository } from './repository/aircraft.repository';
import { CreateAircraftHandler } from './application/command/create-aircraft.command';
import { UpdateAircraftHandler } from './application/command/update-aircraft.command';
import { RemoveAircraftHandler } from './application/command/remove-aircraft.command';
import { GetAircraftByIdHandler } from './application/query/get-aircraft-by-id.query';
import { ListAllAircraftHandler } from './application/query/list-all-aircraft.query';
import { CheckAircraftExistsHandler } from './application/query/check-aircraft-exists.query';

@Module({
  controllers: [AircraftController],
  imports: [PrismaModule],
  providers: [
    AircraftRepository,
    CreateAircraftHandler,
    UpdateAircraftHandler,
    RemoveAircraftHandler,
    GetAircraftByIdHandler,
    ListAllAircraftHandler,
    CheckAircraftExistsHandler,
  ],
  exports: [AircraftRepository],
})
export class AircraftModule {}
