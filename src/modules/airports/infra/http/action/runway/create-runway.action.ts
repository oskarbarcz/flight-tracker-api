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
import {
  CreateRunwayRequest,
  GetRunwayResponse,
} from '../../request/runway.dto';
import { CreateRunwayCommand } from '../../../../application/command/runways/create-runway.command';
import { GetRunwayByIdQuery } from '../../../../application/query/runway/get-runway-by-id.query';

@ApiTags('airport runway')
@Controller('api/v1/airport/:airportId/runway')
export class CreateRunwayAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Create new runway at given airport',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'airportId', description: 'Airport unique identifier' })
  @ApiBody({ type: CreateRunwayRequest })
  @ApiCreatedResponse({ type: GetRunwayResponse })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Post()
  @Role(UserRole.Operations)
  async run(
    @UuidParam('airportId') airportId: string,
    @Body() body: CreateRunwayRequest,
  ): Promise<GetRunwayResponse> {
    const runwayId = v4();

    const command = new CreateRunwayCommand(airportId, runwayId, body);
    await this.commandBus.execute(command);

    const query = new GetRunwayByIdQuery(airportId, runwayId);
    return this.queryBus.execute(query);
  }
}
