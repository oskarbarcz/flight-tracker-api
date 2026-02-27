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
import { Controller, Delete, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { GenericBadRequestResponse } from '../../../../../core/http/response/bad-request.response';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { GenericNotFoundResponse } from '../../../../../core/http/response/not-found.response';
import { ForbiddenResponse } from '../../../../../core/http/response/forbidden.response';
import { Role } from '../../../../../core/http/auth/decorator/role.decorator';
import { UserRole } from '../../../../../../prisma/client/enums';
import { UuidParam } from '../../../../../core/validation/uuid.param';
import { AddFlightToRotationCommand } from '../../../application/command/rotation/add-flight-to-rotation.command';
import { RemoveFlightFromRotationCommand } from '../../../application/command/rotation/remove-flight-from-rotation.command';
import { CommandBus } from '@nestjs/cqrs';
import { GenericConflictResponse } from '../../../../../core/http/response/conflict.response';

@ApiTags('flight rotations')
@Controller('/api/v1/flight/:flightId/rotation')
export class RotationsController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({
    summary: 'Assign a flight to a rotation',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'flightId', description: 'Flight unique identifier' })
  @ApiParam({ name: 'rotationId', description: 'Rotation unique identifier' })
  @ApiNoContentResponse({
    description: 'Flight was assigned to rotation successfully',
  })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @ApiConflictResponse({ type: GenericConflictResponse })
  @Post(':rotationId')
  @Role(UserRole.Operations)
  @HttpCode(HttpStatus.NO_CONTENT)
  async addFlightToRotation(
    @UuidParam('flightId') flightId: string,
    @UuidParam('rotationId') rotationId: string,
  ): Promise<void> {
    const command = new AddFlightToRotationCommand(flightId, rotationId);
    await this.commandBus.execute(command);
  }

  @ApiOperation({
    summary: 'Remove a flight from a rotation',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'flightId', description: 'Flight unique identifier' })
  @ApiParam({ name: 'rotationId', description: 'Rotation unique identifier' })
  @ApiNoContentResponse({
    description: 'Flight was removed from rotation successfully',
  })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @ApiConflictResponse({ type: GenericConflictResponse })
  @Delete(':rotationId')
  @Role(UserRole.Operations)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeFlightFromRotation(
    @UuidParam('flightId') flightId: string,
    @UuidParam('rotationId') rotationId: string,
  ): Promise<void> {
    const command = new RemoveFlightFromRotationCommand(flightId, rotationId);
    await this.commandBus.execute(command);
  }
}
