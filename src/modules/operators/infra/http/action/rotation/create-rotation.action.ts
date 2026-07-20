import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Body, Controller, Post } from '@nestjs/common';
import { UserRole } from '../../../../../users/model/user-role';
import {
  CreateRotationRequest,
  GetRotationResponse,
} from '../../request/rotation.request';
import { GenericBadRequestResponse } from '../../../../../../core/http/response/bad-request.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { v4 } from 'uuid';
import { CreateRotationCommand } from '../../../../application/command/rotation/create-rotation.command';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { GetRotationByIdQuery } from '../../../../application/query/rotation/get-rotation-by-id.query';

@ApiTags('operator rotations')
@Controller('/api/v1/operator/:operatorId/rotation')
export class CreateRotationAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Create rotation for operator',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'operatorId', description: 'Operator unique identifier' })
  @ApiBody({ type: CreateRotationRequest })
  @ApiCreatedResponse({ type: GetRotationResponse })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Post()
  @Role(UserRole.Operations)
  async create(
    @UuidParam('operatorId') operatorId: string,
    @Body() request: CreateRotationRequest,
  ): Promise<GetRotationResponse> {
    const rotationId = v4();

    const command = new CreateRotationCommand(operatorId, rotationId, request);
    await this.commandBus.execute(command);

    const query = new GetRotationByIdQuery(operatorId, rotationId);
    return this.queryBus.execute(query);
  }
}
