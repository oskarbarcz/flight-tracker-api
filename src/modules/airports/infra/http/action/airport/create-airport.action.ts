import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { v4 } from 'uuid';
import { UserRole } from '../../../../../users/model/user-role';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';
import { GenericBadRequestResponse } from '../../../../../../core/http/response/bad-request.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import {
  CreateAirportRequest,
  GetAirportResponse,
} from '../../request/airport.dto';
import { CreateAirportCommand } from '../../../../application/command/create-airport.command';
import { GetAirportByIdQuery } from '../../../../application/query/get-airport-by-id.query';
import { Airport } from '../../../../model/airport.model';

@ApiTags('airport')
@Controller('api/v1/airport')
export class CreateAirportAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Create new airport',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiBody({ type: CreateAirportRequest })
  @ApiCreatedResponse({ type: Airport })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @Post()
  @Role(UserRole.Operations)
  async run(@Body() body: CreateAirportRequest): Promise<GetAirportResponse> {
    const airportId = v4();

    const command = new CreateAirportCommand(airportId, body);
    await this.commandBus.execute(command);

    const query = new GetAirportByIdQuery(airportId);
    return this.queryBus.execute(query);
  }
}
