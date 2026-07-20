import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
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
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';
import { GenericBadRequestResponse } from '../../../../../../core/http/response/bad-request.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { RemoveGateCommand } from '../../../../application/command/gates/remove-gate.command';

@ApiTags('airport gate')
@Controller('api/v1/airport/:airportId/gate')
export class DeleteGateAction {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({
    summary: 'Remove gate',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'airportId', description: 'Airport unique identifier' })
  @ApiParam({ name: 'gateId', description: 'Gate unique identifier' })
  @ApiNoContentResponse()
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Delete(':gateId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Role(UserRole.Operations)
  async run(
    @UuidParam('airportId') airportId: string,
    @UuidParam('gateId') gateId: string,
  ): Promise<void> {
    const command = new RemoveGateCommand(airportId, gateId);
    await this.commandBus.execute(command);
  }
}
