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
  GetTerminalResponse,
  UpdateTerminalRequest,
} from '../../request/terminal.dto';
import { UpdateTerminalCommand } from '../../../../application/command/terminals/update-terminal.command';
import { GetTerminalByIdQuery } from '../../../../application/query/terminal/get-terminal-by-id.query';

@ApiTags('airport terminal')
@Controller('api/v1/airport/:airportId/terminal')
export class UpdateTerminalAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Update terminal',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'airportId', description: 'Airport unique identifier' })
  @ApiParam({ name: 'terminalId', description: 'Terminal unique identifier' })
  @ApiBody({ type: UpdateTerminalRequest })
  @ApiOkResponse({ type: GetTerminalResponse })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Patch(':terminalId')
  @Role(UserRole.Operations)
  async run(
    @UuidParam('airportId') airportId: string,
    @UuidParam('terminalId') terminalId: string,
    @Body() body: UpdateTerminalRequest,
  ): Promise<GetTerminalResponse> {
    const command = new UpdateTerminalCommand(airportId, terminalId, body);
    await this.commandBus.execute(command);

    const query = new GetTerminalByIdQuery(airportId, terminalId);
    return this.queryBus.execute(query);
  }
}
