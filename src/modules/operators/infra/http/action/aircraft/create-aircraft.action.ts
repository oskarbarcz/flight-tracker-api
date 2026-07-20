import {
  ApiBadRequestResponse,
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
} from '@nestjs/swagger';
import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GenericBadRequestResponse } from '../../../../../../core/http/response/bad-request.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';
import { v4 } from 'uuid';
import { UserRole } from '../../../../../users/model/user-role';
import {
  CreateAircraftRequest,
  GetAircraftResponse,
} from '../../request/aircraft.request';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { CreateAircraftCommand } from '../../../../application/command/aircraft/create-aircraft.command';
import { GenericConflictResponse } from '../../../../../../core/http/response/conflict.response';
import { GetAircraftByIdQuery } from '../../../../application/query/aircraft/get-aircraft-by-id.query';

@ApiTags('operator fleet')
@Controller('/api/v1/operator/:operatorId/aircraft')
export class CreateAircraftAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Register new aircraft for operator',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'operatorId',
    description: 'Operator unique identifier',
  })
  @ApiBody({ type: CreateAircraftRequest })
  @ApiCreatedResponse({ type: GetAircraftResponse })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @ApiConflictResponse({ type: GenericConflictResponse })
  @Post()
  @Role(UserRole.Operations)
  async create(
    @UuidParam('operatorId') operatorId: string,
    @Body() request: CreateAircraftRequest,
  ): Promise<GetAircraftResponse> {
    const aircraftId = v4();

    const command = new CreateAircraftCommand(operatorId, aircraftId, request);
    await this.commandBus.execute(command);

    const query = new GetAircraftByIdQuery(operatorId, aircraftId);
    return this.queryBus.execute(query);
  }
}
