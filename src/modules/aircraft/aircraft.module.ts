import { Module } from '@nestjs/common';
import { LegacyAircraftController } from './controller/aircraft.controller';
import { PrismaModule } from '../../core/provider/prisma/prisma.module';
import { AircraftRepository } from '../operators/infra/database/repository/aircraft.repository';
import { LegacyCreateAircraftHandler } from './application/command/legacy-create-aircraft.command';
import { LegacyUpdateAircraftHandler } from './application/command/legacy-update-aircraft.command';
import { LegacyRemoveAircraftHandler } from './application/command/legacy-remove-aircraft.command';
import { LegacyGetAircraftByIdHandler } from './application/query/legacy-get-aircraft-by-id.query';
import { LegacyListAllAircraftHandler } from './application/query/legacy-list-all-aircraft.query';

@Module({
  controllers: [LegacyAircraftController],
  imports: [PrismaModule],
  providers: [
    AircraftRepository,
    LegacyCreateAircraftHandler,
    LegacyUpdateAircraftHandler,
    LegacyRemoveAircraftHandler,
    LegacyGetAircraftByIdHandler,
    LegacyListAllAircraftHandler,
  ],
  exports: [AircraftRepository],
})
export class AircraftModule {}
