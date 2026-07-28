import { Module } from '@nestjs/common';
import { CreateOperatorAction } from './infra/http/action/operator/create-operator.action';
import { ListOperatorsAction } from './infra/http/action/operator/list-operators.action';
import { GetOperatorAction } from './infra/http/action/operator/get-operator.action';
import { UpdateOperatorAction } from './infra/http/action/operator/update-operator.action';
import { DeleteOperatorAction } from './infra/http/action/operator/delete-operator.action';
import { PrismaModule } from '../../core/provider/prisma/prisma.module';
import { OperatorsRepository } from './infra/database/repository/operators.repository';
import { CreateOperatorHandler } from './application/command/create-operator.command';
import { UpdateOperatorHandler } from './application/command/update-operator.command';
import { RemoveOperatorHandler } from './application/command/remove-operator.command';
import { GetOperatorByIdHandler } from './application/query/get-operator-by-id.query';
import { ListAllOperatorsHandler } from './application/query/list-all-operators.query';
import { CheckOperatorExistsHandler } from './application/query/check-operator-exists.query';
import { GetOperatorByIcaoCodeHandler } from './application/query/get-operator-by-icao-code.query';
import { AssertOperatorExistsHandler } from './application/assert/assert-operator-exists.query';
import { AircraftLifecycleListener } from './application/event/external/aircraft-lifecycle.listener';
import { OperatorCacheListener } from './application/event/internal/operator-cache.listener';

@Module({
  imports: [PrismaModule],
  controllers: [
    CreateOperatorAction,
    ListOperatorsAction,
    GetOperatorAction,
    UpdateOperatorAction,
    DeleteOperatorAction,
  ],
  providers: [
    OperatorsRepository,
    CreateOperatorHandler,
    UpdateOperatorHandler,
    RemoveOperatorHandler,
    GetOperatorByIdHandler,
    GetOperatorByIcaoCodeHandler,
    ListAllOperatorsHandler,
    CheckOperatorExistsHandler,
    AssertOperatorExistsHandler,
    AircraftLifecycleListener,
    OperatorCacheListener,
  ],
})
export class OperatorsModule {}
