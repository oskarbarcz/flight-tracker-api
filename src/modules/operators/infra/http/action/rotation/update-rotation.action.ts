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
import { Body, Controller, Patch } from '@nestjs/common';
import { UserRole } from '../../../../../users/model/user-role';
import {
  GetRotationResponse,
  UpdateRotationRequest,
} from '../../request/rotation.request';
import { GenericBadRequestResponse } from '../../../../../../core/http/response/bad-request.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { GetRotationByIdQuery } from '../../../../application/query/rotation/get-rotation-by-id.query';
import { UpdateRotationCommand } from '../../../../application/command/rotation/update-rotation.command';

@ApiTags('operator rotations')
@Controller('/api/v1/operator/:operatorId/rotation')
export class UpdateRotationAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Update a rotation',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'operatorId', description: 'Operator unique identifier' })
  @ApiParam({ name: 'rotationId', description: 'Rotation unique identifier' })
  @ApiBody({ type: UpdateRotationRequest })
  @ApiOkResponse({ type: GetRotationResponse })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Patch(':rotationId')
  @Role(UserRole.Operations)
  async update(
    @UuidParam('rotationId') rotationId: string,
    @UuidParam('operatorId') operatorId: string,
    @Body() request: UpdateRotationRequest,
  ): Promise<GetRotationResponse> {
    const command = new UpdateRotationCommand(operatorId, rotationId, request);
    await this.commandBus.execute(command);

    const query = new GetRotationByIdQuery(operatorId, rotationId);
    return this.queryBus.execute(query);
  }
}
