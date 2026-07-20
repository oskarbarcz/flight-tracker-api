import { Body, Controller, Patch } from '@nestjs/common';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Operator } from '../../../../model/operator.model';
import { GenericBadRequestResponse } from '../../../../../../core/http/response/bad-request.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';
import { UserRole } from '../../../../../users/model/user-role';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UpdateOperatorCommand } from '../../../../application/command/update-operator.command';
import { GetOperatorByIdQuery } from '../../../../application/query/get-operator-by-id.query';
import { UpdateOperatorRequest } from '../../request/operator.request';

@ApiTags('operator')
@Controller('/api/v1/operator')
export class UpdateOperatorAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Update operator',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'id',
    description: 'Operator unique identifier',
  })
  @ApiBody({ type: UpdateOperatorRequest })
  @ApiOkResponse({ type: Operator })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Patch(':id')
  @Role(UserRole.Operations)
  async update(
    @UuidParam('id') id: string,
    @Body() updateOperatorDto: UpdateOperatorRequest,
  ): Promise<Operator> {
    const command = new UpdateOperatorCommand(id, updateOperatorDto);
    await this.commandBus.execute(command);

    const query = new GetOperatorByIdQuery(id);
    return this.queryBus.execute(query);
  }
}
