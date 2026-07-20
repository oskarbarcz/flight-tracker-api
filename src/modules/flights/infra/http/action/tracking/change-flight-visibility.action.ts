import { Body, Controller, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { UserRole } from '../../../../../users/model/user-role';
import { GenericBadRequestResponse } from '../../../../../../core/http/response/bad-request.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { UpdateFlightVisibilityRequest } from '../../request/flight.dto';
import { ChangeFlightVisibilityCommand } from '../../../../application/command/change-flight-visibility.command';

@ApiTags('flight')
@Controller('api/v1/flight')
export class ChangeFlightVisibilityAction {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({
    summary: 'Change flight visibility settings',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'id',
    description: 'Flight unique identifier',
  })
  @ApiBody({
    description: 'New visibility settings',
    type: UpdateFlightVisibilityRequest,
  })
  @ApiNoContentResponse()
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Patch('/:id/tracking')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Role(UserRole.Operations)
  async run(
    @UuidParam('id') id: string,
    @Body() body: UpdateFlightVisibilityRequest,
  ): Promise<void> {
    const command = new ChangeFlightVisibilityCommand(id, body.tracking);
    await this.commandBus.execute(command);
  }
}
