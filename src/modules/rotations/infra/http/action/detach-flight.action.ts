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
  ApiUnprocessableEntityResponse,
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
import { DetachFlightFromLegCommand } from '../../../application/command/detach-flight-from-leg.command';
import { GetRotationByIdQuery } from '../../../application/query/get-rotation-by-id.query';

@ApiTags('rotation')
@Controller('/api/v1/rotation')
export class DetachFlightAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ summary: 'Detach the flight from a rotation leg' })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({ type: Rotation })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @ApiConflictResponse({ type: GenericConflictResponse })
  @ApiUnprocessableEntityResponse()
  @Delete(':rotationId/leg/:legId/flight')
  @Role(UserRole.Operations)
  async detach(
    @UuidParam('rotationId') rotationId: string,
    @UuidParam('legId') legId: string,
    @Req() request: AuthorizedRequest,
  ): Promise<Rotation> {
    const command = new DetachFlightFromLegCommand(
      rotationId,
      legId,
      request.user.sub,
    );
    await this.commandBus.execute(command);

    const query = new GetRotationByIdQuery(rotationId);
    return this.queryBus.execute(query);
  }
}
