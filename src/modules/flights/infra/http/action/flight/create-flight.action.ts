import { Body, Controller, Post, Req } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { v4 } from 'uuid';
import { UserRole } from 'prisma/client/client';
import {
  CreateFlightRequest,
  GetFlightResponse,
} from '../../request/flight.dto';
import { GenericBadRequestResponse } from '../../../../../../core/http/response/bad-request.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';
import { AuthorizedRequest } from '../../../../../../core/http/request/authorized.request';
import { CreateFlightCommand } from '../../../../application/command/create-flight.command';
import { GetFlightQuery } from '../../../../application/query/get-flight.query';

@ApiTags('flight')
@Controller('api/v1/flight')
export class CreateFlightAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Create a flight',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiBody({ type: CreateFlightRequest })
  @ApiCreatedResponse({
    description: 'Flight was created',
    type: GetFlightResponse,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
    type: GenericBadRequestResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @ApiForbiddenResponse({
    description: 'User is not allowed to perform this action',
    type: ForbiddenResponse,
  })
  @ApiNotFoundResponse({
    description: 'Airports or aircraft does not exist',
    type: GenericNotFoundResponse,
  })
  @Post()
  @Role(UserRole.Operations)
  async run(
    @Req() request: AuthorizedRequest,
    @Body() input: CreateFlightRequest,
  ): Promise<GetFlightResponse> {
    const flightId = v4();

    const command = new CreateFlightCommand(flightId, input, request.user.sub);
    await this.commandBus.execute(command);

    const query = new GetFlightQuery(flightId);
    return this.queryBus.execute(query);
  }
}
