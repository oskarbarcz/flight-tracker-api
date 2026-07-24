import { Body, Controller, Patch, Req } from '@nestjs/common';
import { AuthorizedRequest } from '../../../../../core/http/request/authorized.request';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UuidParam } from '../../../../../core/validation/uuid.param';
import { Role } from '../../../../../core/http/auth/decorator/role.decorator';
import { UserRole } from '../../../../users/model/user-role';
import { GenericBadRequestResponse } from '../../../../../core/http/response/bad-request.response';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../core/http/response/forbidden.response';
import { GenericNotFoundResponse } from '../../../../../core/http/response/not-found.response';
import { GenericConflictResponse } from '../../../../../core/http/response/conflict.response';
import { Rotation } from '../../../model/rotation.model';
import { UpdateLegRequest } from '../request/rotation.request';
import { UpdateLegCommand } from '../../../application/command/update-leg.command';
import { GetRotationByIdQuery } from '../../../application/query/get-rotation-by-id.query';

@ApiTags('rotation leg')
@Controller('/api/v1/rotation')
export class UpdateLegAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ summary: 'Update a rotation leg' })
  @ApiBearerAuth('jwt')
  @ApiBody({ type: UpdateLegRequest })
  @ApiOkResponse({ type: Rotation })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @ApiConflictResponse({ type: GenericConflictResponse })
  @Patch(':rotationId/leg/:legId')
  @Role(UserRole.Operations)
  async updateLeg(
    @UuidParam('rotationId') rotationId: string,
    @UuidParam('legId') legId: string,
    @Body() body: UpdateLegRequest,
    @Req() request: AuthorizedRequest,
  ): Promise<Rotation> {
    const command = new UpdateLegCommand(
      rotationId,
      legId,
      body,
      request.user.sub,
    );
    await this.commandBus.execute(command);

    const query = new GetRotationByIdQuery(rotationId);
    return this.queryBus.execute(query);
  }
}
