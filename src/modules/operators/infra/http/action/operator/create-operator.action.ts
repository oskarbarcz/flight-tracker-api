import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Operator } from '../../../../model/operator.model';
import { GenericBadRequestResponse } from '../../../../../../core/http/response/bad-request.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';
import { UserRole } from '../../../../../users/model/user-role';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateOperatorCommand } from '../../../../application/command/create-operator.command';
import { GetOperatorByIdQuery } from '../../../../application/query/get-operator-by-id.query';
import { v4 } from 'uuid';
import { CreateOperatorRequest } from '../../request/operator.request';

@ApiTags('operator')
@Controller('/api/v1/operator')
export class CreateOperatorAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Create new operator',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiBody({ type: CreateOperatorRequest })
  @ApiCreatedResponse({ type: Operator })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @Post()
  @Role(UserRole.Operations)
  async create(
    @Body() createOperatorDto: CreateOperatorRequest,
  ): Promise<Operator> {
    const operatorId = v4();

    const command = new CreateOperatorCommand(operatorId, createOperatorDto);
    await this.commandBus.execute(command);

    const query = new GetOperatorByIdQuery(operatorId);
    return this.queryBus.execute(query);
  }
}
