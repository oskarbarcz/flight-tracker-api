import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Controller, Delete } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';
import { UserRole } from '../../../../../users/model/user-role';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { GetAircraftResponse } from '../../request/aircraft.request';
import { RemoveHoldVariantCommand } from '../../../../application/command/remove-hold-variant.command';
import { GetAircraftByIdQuery } from '../../../../application/query/get-aircraft-by-id.query';

@ApiTags('aircraft')
@Controller('/api/v1/operator/:operatorId/aircraft')
export class RemoveHoldVariantAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Remove the cargo hold variant assigned to an aircraft',
    description:
      'The aircraft returns to its type default rather than being left without a hold.',
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
  @ApiOkResponse({ type: GetAircraftResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Delete(':aircraftId/hold-variant')
  @Role(UserRole.Operations)
  async remove(
    @UuidParam('operatorId') operatorId: string,
    @UuidParam('aircraftId') aircraftId: string,
  ): Promise<GetAircraftResponse> {
    const command = new RemoveHoldVariantCommand(operatorId, aircraftId);
    await this.commandBus.execute(command);

    const query = new GetAircraftByIdQuery(operatorId, aircraftId);
    return this.queryBus.execute(query);
  }
}
