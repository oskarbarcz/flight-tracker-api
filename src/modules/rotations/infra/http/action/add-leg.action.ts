import { Body, Controller, Post, Req } from '@nestjs/common';
import { AuthorizedRequest } from '../../../../../core/http/request/authorized.request';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
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
import { AddLegRequest } from '../request/rotation.request';
import { AddLegCommand } from '../../../application/command/add-leg.command';
import { GetRotationByIdQuery } from '../../../application/query/get-rotation-by-id.query';

@ApiTags('rotation leg')
@Controller('/api/v1/rotation')
export class AddLegAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ summary: 'Add a leg to a rotation' })
  @ApiBearerAuth('jwt')
  @ApiBody({ type: AddLegRequest })
  @ApiCreatedResponse({ type: Rotation })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @ApiConflictResponse({ type: GenericConflictResponse })
  @Post(':rotationId/leg')
  @Role(UserRole.Operations)
  async addLeg(
    @UuidParam('rotationId') rotationId: string,
    @Body() body: AddLegRequest,
    @Req() request: AuthorizedRequest,
  ): Promise<Rotation> {
    const command = new AddLegCommand(rotationId, body, request.user.sub);
    await this.commandBus.execute(command);

    const query = new GetRotationByIdQuery(rotationId);
    return this.queryBus.execute(query);
  }
}
