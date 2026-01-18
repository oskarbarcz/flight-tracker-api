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

@Module({
  imports: [PrismaModule],
  controllers: [OperatorsController],
  providers: [
    OperatorsRepository,
    CreateOperatorHandler,
    UpdateOperatorHandler,
    RemoveOperatorHandler,
    GetOperatorByIdHandler,
    ListAllOperatorsHandler,
    CheckOperatorExistsHandler,
  ],
  exports: [OperatorsRepository],
})
export class OperatorsModule {}
