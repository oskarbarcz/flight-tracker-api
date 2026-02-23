import { Module } from '@nestjs/common';
import { LegacyAircraftController } from './controller/aircraft.controller';
import { PrismaModule } from '../../core/provider/prisma/prisma.module';
import { AircraftRepository } from '../operators/repository/aircraft.repository';
import { CreateAircraftHandler } from './application/command/legacy-create-aircraft.command';
import { UpdateAircraftHandler } from './application/command/legacy-update-aircraft.command';
import { LegacyRemoveAircraftHandler } from './application/command/legacy-remove-aircraft.command';
import { GetAircraftByIdHandler } from './application/query/get-aircraft-by-id.query';
import { ListAllAircraftHandler } from './application/query/list-all-aircraft.query';
import { CheckAircraftExistsHandler } from './application/query/check-aircraft-exists.query';
import { GetAircraftByRegistrationHandler } from './application/query/get-aircraft-by-registration.query';

@Module({
  controllers: [LegacyAircraftController],
  imports: [PrismaModule],
  providers: [
    AircraftRepository,
    CreateAircraftHandler,
    UpdateAircraftHandler,
    LegacyRemoveAircraftHandler,
    GetAircraftByIdHandler,
    GetAircraftByRegistrationHandler,
    ListAllAircraftHandler,
    CheckAircraftExistsHandler,
  ],
  exports: [AircraftRepository],
})
export class AircraftModule {}
