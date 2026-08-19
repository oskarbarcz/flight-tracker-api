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
import { AssignCabinLayoutRequest } from '../../request/cabin-layout.request';
import { AssignCabinLayoutCommand } from '../../../../application/command/assign-cabin-layout.command';
import { GetAircraftByIdQuery } from '../../../../application/query/get-aircraft-by-id.query';

@ApiTags('aircraft')
@Controller('/api/v1/operator/:operatorId/aircraft')
export class AssignCabinLayoutAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Assign a cabin layout to an aircraft',
    description:
      'Replaces any layout already assigned. A layout of another airline or another aircraft ' +
      'type is accepted, and reported as mismatched on aircraft reads, because AeroLOPA covers ' +
      'neither every airline nor every type.',
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
  @ApiBody({ type: AssignCabinLayoutRequest })
  @ApiOkResponse({ type: GetAircraftResponse })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Put(':aircraftId/cabin-layout')
  @Role(UserRole.Operations)
  async assign(
    @UuidParam('operatorId') operatorId: string,
    @UuidParam('aircraftId') aircraftId: string,
    @Body() request: AssignCabinLayoutRequest,
  ): Promise<GetAircraftResponse> {
    const command = new AssignCabinLayoutCommand(
      operatorId,
      aircraftId,
      request.cabinLayout,
    );
    await this.commandBus.execute(command);

    const query = new GetAircraftByIdQuery(operatorId, aircraftId);
    return this.queryBus.execute(query);
  }
}
