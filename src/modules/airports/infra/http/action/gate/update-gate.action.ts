import { Body, Controller, Patch } from '@nestjs/common';
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
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UserRole } from '../../../../../users/model/user-role';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';
import { GenericBadRequestResponse } from '../../../../../../core/http/response/bad-request.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { GetGateResponse, UpdateGateRequest } from '../../request/gate.dto';
import { UpdateGateCommand } from '../../../../application/command/gates/update-gate.command';
import { GetGateByIdQuery } from '../../../../application/query/gate/get-gate-by-id.query';

@ApiTags('airport gate')
@Controller('api/v1/airport/:airportId/gate')
export class UpdateGateAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Update gate',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'airportId', description: 'Airport unique identifier' })
  @ApiParam({ name: 'gateId', description: 'Gate unique identifier' })
  @ApiBody({ type: UpdateGateRequest })
  @ApiOkResponse({ type: GetGateResponse })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Patch(':gateId')
  @Role(UserRole.Operations)
  async run(
    @UuidParam('airportId') airportId: string,
    @UuidParam('gateId') gateId: string,
    @Body() body: UpdateGateRequest,
  ): Promise<GetGateResponse> {
    const command = new UpdateGateCommand(airportId, gateId, body);
    await this.commandBus.execute(command);

    const query = new GetGateByIdQuery(airportId, gateId);
    return this.queryBus.execute(query);
  }
}
