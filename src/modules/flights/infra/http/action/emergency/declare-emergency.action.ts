import { Body, Controller, Post, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { UserRole } from '../../../../../users/model/user-role';
import {
  DeclareEmergencyRequest,
  GetEmergencyResponse,
} from '../../request/emergency.dto';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { AuthorizedRequest } from '../../../../../../core/http/request/authorized.request';
import { DeclareEmergencyCommand } from '../../../../application/command/emergency/declare-emergency.command';

@ApiTags('flight emergency')
@Controller('api/v1/flight/:flightId/emergency')
export class DeclareEmergencyAction {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({
    summary: 'Declare a flight emergency',
    description:
      'Records a new emergency declaration on the flight. A flight may carry one active emergency at a time — resolve the active one before declaring another. Resolved declarations remain in the flight history.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'flightId', description: 'Flight unique identifier' })
  @ApiBody({ type: DeclareEmergencyRequest })
  @ApiCreatedResponse({ type: GetEmergencyResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @ApiConflictResponse({
    description: 'An unresolved emergency already exists on this flight.',
  })
  @ApiUnprocessableEntityResponse({
    description:
      'Flight is not between off-block and on-block reports, so no emergency can be declared on it.',
  })
  @Post()
  @Role(UserRole.CabinCrew)
  public async run(
    @UuidParam('flightId') flightId: string,
    @Req() request: AuthorizedRequest,
    @Body() body: DeclareEmergencyRequest,
  ): Promise<GetEmergencyResponse> {
    const command = new DeclareEmergencyCommand(flightId, request.user, body);
    return this.commandBus.execute(command);
  }
}
