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
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { UserRole } from '../../../../../users/model/user-role';
import { GenericBadRequestResponse } from '../../../../../../core/http/response/bad-request.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { UpdateFlightRequest } from '../../request/flight.dto';
import { UpdateFlightCommand } from '../../../../application/command/update-flight.command';

@ApiTags('flight')
@Controller('api/v1/flight')
export class UpdateFlightAction {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({
    summary: 'Update flight attributes',
    description:
      '**NOTE:** Service type can only be changed for flights in created status. <br />' +
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'id',
    description: 'Flight unique identifier',
  })
  @ApiBody({
    description: 'Attributes to update; omitted attributes are left unchanged',
    type: UpdateFlightRequest,
  })
  @ApiNoContentResponse()
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @ApiUnprocessableEntityResponse({
    description: 'The flight has already been marked as ready.',
  })
  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Role(UserRole.Operations)
  async run(
    @UuidParam('id') id: string,
    @Body() body: UpdateFlightRequest,
  ): Promise<void> {
    const command = new UpdateFlightCommand(id, body.serviceType);
    await this.commandBus.execute(command);
  }
}
