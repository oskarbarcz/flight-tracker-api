import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Body, Controller, Put } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GenericBadRequestResponse } from '../../../../../../core/http/response/bad-request.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';
import { UserRole } from '../../../../../users/model/user-role';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { GetAircraftResponse } from '../../request/aircraft.request';
import { AssignHoldVariantRequest } from '../../request/hold-variant.request';
import { AssignHoldVariantCommand } from '../../../../application/command/assign-hold-variant.command';
import { GetAircraftByIdQuery } from '../../../../application/query/get-aircraft-by-id.query';

@ApiTags('aircraft')
@Controller('/api/v1/operator/:operatorId/aircraft')
export class AssignHoldVariantAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Assign a cargo hold variant to an aircraft',
    description:
      'Replaces any variant already assigned. Only a variant the aircraft type offers is ' +
      'accepted, because a hold variant describes how that type is fitted out. An aircraft ' +
      'with no variant assigned uses its type default, which is the loosely loaded variant ' +
      'wherever the type offers one.',
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
  @ApiBody({ type: AssignHoldVariantRequest })
  @ApiOkResponse({ type: GetAircraftResponse })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Put(':aircraftId/hold-variant')
  @Role(UserRole.Operations)
  async assign(
    @UuidParam('operatorId') operatorId: string,
    @UuidParam('aircraftId') aircraftId: string,
    @Body() request: AssignHoldVariantRequest,
  ): Promise<GetAircraftResponse> {
    const command = new AssignHoldVariantCommand(
      operatorId,
      aircraftId,
      request.holdVariant,
    );
    await this.commandBus.execute(command);

    const query = new GetAircraftByIdQuery(operatorId, aircraftId);
    return this.queryBus.execute(query);
  }
}
