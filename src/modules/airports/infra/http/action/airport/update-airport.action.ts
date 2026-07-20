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
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { UserRole } from '../../../../../users/model/user-role';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';
import { GenericBadRequestResponse } from '../../../../../../core/http/response/bad-request.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import {
  CreateAirportRequest,
  GetAirportResponse,
  UpdateAirportResponse,
} from '../../request/airport.dto';
import { UpdateAirportCommand } from '../../../../application/command/update-airport.command';
import { GetAirportByIdQuery } from '../../../../application/query/get-airport-by-id.query';

@ApiTags('airport')
@Controller('api/v1/airport')
export class UpdateAirportAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Update airport',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'id',
    description: 'Airport unique identifier',
  })
  @ApiBody({ type: UpdateAirportResponse })
  @ApiOkResponse({ type: GetAirportResponse })
  @ApiBadRequestResponse({
    type: GenericBadRequestResponse<CreateAirportRequest>,
  })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Patch(':id')
  @Role(UserRole.Operations)
  async run(
    @UuidParam('id') id: string,
    @Body() body: UpdateAirportResponse,
  ): Promise<GetAirportResponse> {
    const command = new UpdateAirportCommand(id, body);
    await this.commandBus.execute(command);

    const query = new GetAirportByIdQuery(id);
    return this.queryBus.execute(query);
  }
}
