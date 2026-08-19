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
import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { GenericBadRequestResponse } from '../../../../../../core/http/response/bad-request.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';
import { UserRole } from '../../../../../users/model/user-role';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { RemoveCabinLayoutCommand } from '../../../../application/command/remove-cabin-layout.command';

@ApiTags('aircraft')
@Controller('/api/v1/operator/:operatorId/aircraft')
export class RemoveCabinLayoutAction {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({
    summary: 'Remove the cabin layout assigned to an aircraft',
    description:
      'Leaves the aircraft without a cabin, which is also the state of an aircraft AeroLOPA ' +
      'does not cover.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'operatorId',
    description: 'Operator unique identifier',
  })
  @ApiParam({
    name: 'aircraftId',
    description: 'Aircraft unique identifier',
  })
  @ApiNoContentResponse({
    description: 'Cabin layout assignment was removed.',
  })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Delete(':aircraftId/cabin-layout')
  @Role(UserRole.Operations)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @UuidParam('operatorId') operatorId: string,
    @UuidParam('aircraftId') aircraftId: string,
  ): Promise<void> {
    const command = new RemoveCabinLayoutCommand(operatorId, aircraftId);
    await this.commandBus.execute(command);
  }
}
