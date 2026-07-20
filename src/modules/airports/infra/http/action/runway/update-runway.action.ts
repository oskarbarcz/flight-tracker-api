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
import {
  GetRunwayResponse,
  UpdateRunwayRequest,
} from '../../request/runway.dto';
import { UpdateRunwayCommand } from '../../../../application/command/runways/update-runway.command';
import { GetRunwayByIdQuery } from '../../../../application/query/runway/get-runway-by-id.query';

@ApiTags('airport runway')
@Controller('api/v1/airport/:airportId/runway')
export class UpdateRunwayAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Update runway',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'airportId', description: 'Airport unique identifier' })
  @ApiParam({ name: 'runwayId', description: 'Runway unique identifier' })
  @ApiBody({ type: UpdateRunwayRequest })
  @ApiOkResponse({ type: GetRunwayResponse })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Patch(':runwayId')
  @Role(UserRole.Operations)
  async run(
    @UuidParam('airportId') airportId: string,
    @UuidParam('runwayId') runwayId: string,
    @Body() body: UpdateRunwayRequest,
  ): Promise<GetRunwayResponse> {
    const command = new UpdateRunwayCommand(airportId, runwayId, body);
    await this.commandBus.execute(command);

    const query = new GetRunwayByIdQuery(airportId, runwayId);
    return this.queryBus.execute(query);
  }
}
