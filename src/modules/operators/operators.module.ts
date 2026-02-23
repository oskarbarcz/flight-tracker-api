import { Module } from '@nestjs/common';
import { OperatorsController } from './controller/operators.controller';
import { PrismaModule } from '../../core/provider/prisma/prisma.module';
import { OperatorsRepository } from './repository/operators.repository';
import { CreateOperatorHandler } from './application/command/create-operator.command';
import { UpdateOperatorHandler } from './application/command/update-operator.command';
import { RemoveOperatorHandler } from './application/command/remove-operator.command';
import { GetOperatorByIdHandler } from './application/query/get-operator-by-id.query';
import { ListAllOperatorsHandler } from './application/query/list-all-operators.query';
import { CheckOperatorExistsHandler } from './application/query/check-operator-exists.query';
import { GetOperatorByIcaoCodeHandler } from './application/query/get-operator-by-icao-code.query';
import { AircraftController } from './controller/aircraft.controller';
import { CreateAircraftHandler } from './application/command/aircraft/create-aircraft.command';
import { AircraftRepository } from './repository/aircraft.repository';
import { GetAircraftByIdHandler } from './application/query/aircraft/get-aircraft-by-id.query';
import { ListAllAircraftHandler } from './application/query/aircraft/list-all-aircraft.query';

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
  ],
})
export class OperatorsModule {}
