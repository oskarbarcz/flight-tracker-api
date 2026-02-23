import { Module } from '@nestjs/common';
import { OperatorsController } from './infra/http/controller/operators.controller';
import { PrismaModule } from '../../core/provider/prisma/prisma.module';
import { OperatorsRepository } from './infra/database/repository/operators.repository';
import { CreateOperatorHandler } from './application/command/create-operator.command';
import { UpdateOperatorHandler } from './application/command/update-operator.command';
import { RemoveOperatorHandler } from './application/command/remove-operator.command';
import { GetOperatorByIdHandler } from './application/query/get-operator-by-id.query';
import { ListAllOperatorsHandler } from './application/query/list-all-operators.query';
import { CheckOperatorExistsHandler } from './application/query/check-operator-exists.query';
import { GetOperatorByIcaoCodeHandler } from './application/query/get-operator-by-icao-code.query';
import { AircraftController } from './infra/http/controller/aircraft.controller';
import { CreateAircraftHandler } from './application/command/aircraft/create-aircraft.command';
import { AircraftRepository } from './infra/database/repository/aircraft.repository';
import { GetAircraftByIdHandler } from './application/query/aircraft/get-aircraft-by-id.query';
import { ListAllAircraftHandler } from './application/query/aircraft/list-all-aircraft.query';
import { GetAircraftByRegistrationHandler } from './application/query/aircraft/get-aircraft-by-registration.query';
import { CheckAircraftExistsHandler } from './application/query/aircraft/check-aircraft-exists.query';
import { RemoveAircraftHandler } from './application/command/aircraft/remove-aircraft.command';
import { UpdateAircraftHandler } from './application/command/aircraft/update-aircraft.command';

@Module({
  imports: [PrismaModule],
  controllers: [OperatorsController, AircraftController],
  providers: [
    OperatorsRepository,
    AircraftRepository,
    CreateOperatorHandler,
    UpdateOperatorHandler,
    RemoveOperatorHandler,
    GetOperatorByIdHandler,
    GetOperatorByIcaoCodeHandler,
    ListAllOperatorsHandler,
    CheckOperatorExistsHandler,
    CreateAircraftHandler,
    ListAllAircraftHandler,
    GetAircraftByIdHandler,
    RemoveAircraftHandler,
    UpdateAircraftHandler,
    GetAircraftByRegistrationHandler,
    CheckAircraftExistsHandler,
  ],
})
export class OperatorsModule {}
