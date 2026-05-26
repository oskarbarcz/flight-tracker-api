import { Controller, Delete, HttpCode, HttpStatus, Req } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { UserRole } from '../../../../../../../prisma/client/enums';
import { GenericBadRequestResponse } from '../../../../../../core/http/response/bad-request.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { GenericConflictResponse } from '../../../../../../core/http/response/conflict.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { RemoveFlightFromRotationCommand } from '../../../../application/command/rotation/remove-flight-from-rotation.command';
import { AuthorizedRequest } from '../../../../../../core/http/request/authorized.request';

@ApiTags('flight rotations')
@Controller('/api/v1/flight/:flightId/rotation')
export class RemoveFlightFromRotationAction {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({
    summary: 'Remove a flight from a rotation',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'flightId', description: 'Flight unique identifier' })
  @ApiParam({ name: 'rotationId', description: 'Rotation unique identifier' })
  @ApiNoContentResponse()
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @ApiConflictResponse({ type: GenericConflictResponse })
  @Delete(':rotationId')
  @Role(UserRole.Operations)
  @HttpCode(HttpStatus.NO_CONTENT)
  async run(
    @UuidParam('flightId') flightId: string,
    @UuidParam('rotationId') rotationId: string,
    @Req() request: AuthorizedRequest,
  ): Promise<void> {
    const command = new RemoveFlightFromRotationCommand(
      flightId,
      rotationId,
      request.user.sub,
    );
    await this.commandBus.execute(command);
  }
}
