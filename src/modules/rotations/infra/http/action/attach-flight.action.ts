import { Controller, Put, Req } from '@nestjs/common';
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
import { AttachFlightToLegCommand } from '../../../application/command/attach-flight-to-leg.command';
import { GetRotationByIdQuery } from '../../../application/query/get-rotation-by-id.query';

@ApiTags('rotation')
@Controller('/api/v1/rotation')
export class AttachFlightAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ summary: 'Attach a flight to a rotation leg' })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({ type: Rotation })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @ApiConflictResponse({ type: GenericConflictResponse })
  @ApiUnprocessableEntityResponse()
  @Put(':rotationId/leg/:legId/flight/:flightId')
  @Role(UserRole.Operations)
  async attach(
    @UuidParam('rotationId') rotationId: string,
    @UuidParam('legId') legId: string,
    @UuidParam('flightId') flightId: string,
    @Req() request: AuthorizedRequest,
  ): Promise<Rotation> {
    const command = new AttachFlightToLegCommand(
      rotationId,
      legId,
      flightId,
      request.user.sub,
    );
    await this.commandBus.execute(command);

    const query = new GetRotationByIdQuery(rotationId);
    return this.queryBus.execute(query);
  }
}
