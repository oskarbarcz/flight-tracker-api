import { Controller, Delete, HttpCode, HttpStatus, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { UserRole } from 'prisma/client/client';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { AuthorizedRequest } from '../../../../../../core/http/request/authorized.request';
import { ResolveEmergencyCommand } from '../../../../application/command/emergency/resolve-emergency.command';

@ApiTags('flight emergency')
@Controller('api/v1/flight/:flightId/emergency')
export class ResolveEmergencyAction {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({
    summary: 'Resolve an emergency declaration',
    description:
      'Marks the emergency as resolved. The record stays in the flight history with `resolvedAt` and `resolvedBy` populated, but the flight no longer counts as having an active emergency and another declaration may be filed.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'flightId', description: 'Flight unique identifier' })
  @ApiParam({
    name: 'emergencyId',
    description: 'Emergency declaration unique identifier',
  })
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @ApiUnprocessableEntityResponse({
    description: 'The emergency has already been resolved.',
  })
  @Delete(':emergencyId')
  @Role(UserRole.CabinCrew)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async run(
    @UuidParam('flightId') flightId: string,
    @UuidParam('emergencyId') emergencyId: string,
    @Req() request: AuthorizedRequest,
  ): Promise<void> {
    const command = new ResolveEmergencyCommand(
      flightId,
      emergencyId,
      request.user,
    );
    await this.commandBus.execute(command);
  }
}
