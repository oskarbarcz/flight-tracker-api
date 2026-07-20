import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UserRole } from '../../../../../users/model/user-role';
import { v4 } from 'uuid';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';
import { GenericBadRequestResponse } from '../../../../../../core/http/response/bad-request.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { CreateGateRequest, GetGateResponse } from '../../request/gate.dto';
import { CreateGateCommand } from '../../../../application/command/gates/create-gate.command';
import { GetGateByIdQuery } from '../../../../application/query/gate/get-gate-by-id.query';

@ApiTags('airport gate')
@Controller('api/v1/airport/:airportId/gate')
export class CreateGateAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Create new gate at given airport',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'airportId', description: 'Airport unique identifier' })
  @ApiBody({ type: CreateGateRequest })
  @ApiCreatedResponse({ type: GetGateResponse })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Post()
  @Role(UserRole.Operations)
  async run(
    @UuidParam('airportId') airportId: string,
    @Body() body: CreateGateRequest,
  ): Promise<GetGateResponse> {
    const gateId = v4();

    const command = new CreateGateCommand(airportId, gateId, body);
    await this.commandBus.execute(command);

    const query = new GetGateByIdQuery(airportId, gateId);
    return this.queryBus.execute(query);
  }
}
