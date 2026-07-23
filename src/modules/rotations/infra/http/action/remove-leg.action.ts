import { Controller, Delete, Req } from '@nestjs/common';
import { AuthorizedRequest } from '../../../../../core/http/request/authorized.request';
import {
  ApiBearerAuth,
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
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../core/http/response/forbidden.response';
import { GenericNotFoundResponse } from '../../../../../core/http/response/not-found.response';
import { GenericConflictResponse } from '../../../../../core/http/response/conflict.response';
import { Rotation } from '../../../model/rotation.model';
import { RemoveLegCommand } from '../../../application/command/remove-leg.command';
import { GetRotationByIdQuery } from '../../../application/query/get-rotation-by-id.query';

@ApiTags('rotation')
@Controller('/api/v1/rotation')
export class RemoveLegAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ summary: 'Remove a leg from a rotation' })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({ type: Rotation })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @ApiConflictResponse({ type: GenericConflictResponse })
  @Delete(':rotationId/leg/:legId')
  @Role(UserRole.Operations)
  async removeLeg(
    @UuidParam('rotationId') rotationId: string,
    @UuidParam('legId') legId: string,
    @Req() request: AuthorizedRequest,
  ): Promise<Rotation> {
    const command = new RemoveLegCommand(rotationId, legId, request.user.sub);
    await this.commandBus.execute(command);

    const query = new GetRotationByIdQuery(rotationId);
    return this.queryBus.execute(query);
  }
}
