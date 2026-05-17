import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
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
import { UpdateEmergencyRequest } from '../../request/emergency.dto';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { AuthorizedRequest } from '../../../../../../core/http/request/authorized.request';
import { UpdateEmergencyCommand } from '../../../../application/command/emergency/update-emergency.command';

@ApiTags('flight emergency')
@Controller('api/v1/flight/:flightId/emergency')
export class UpdateEmergencyAction {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({
    summary: 'Update an active emergency declaration',
    description:
      'Modifies fields of an emergency declaration as the situation evolves. Only the unresolved declaration is mutable — once resolved, the record is immutable history.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'flightId', description: 'Flight unique identifier' })
  @ApiParam({
    name: 'emergencyId',
    description: 'Emergency declaration unique identifier',
  })
  @ApiBody({ type: UpdateEmergencyRequest })
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @ApiUnprocessableEntityResponse({
    description:
      'The emergency has already been resolved and cannot be edited.',
  })
  @Patch(':emergencyId')
  @Role(UserRole.CabinCrew)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async run(
    @UuidParam('flightId') flightId: string,
    @UuidParam('emergencyId') emergencyId: string,
    @Req() request: AuthorizedRequest,
    @Body() body: UpdateEmergencyRequest,
  ): Promise<void> {
    const command = new UpdateEmergencyCommand(
      flightId,
      emergencyId,
      request.user,
      body,
    );
    await this.commandBus.execute(command);
  }
}
