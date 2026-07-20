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
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';
import { GenericBadRequestResponse } from '../../../../../../core/http/response/bad-request.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import {
  CreateTerminalRequest,
  GetTerminalResponse,
} from '../../request/terminal.dto';
import { CreateTerminalCommand } from '../../../../application/command/terminals/create-terminal.command';
import { GetTerminalByIdQuery } from '../../../../application/query/terminal/get-terminal-by-id.query';
import { v4 } from 'uuid';

@ApiTags('airport terminal')
@Controller('api/v1/airport/:airportId/terminal')
export class CreateTerminalAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Create new terminal at given airport',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'airportId', description: 'Airport unique identifier' })
  @ApiBody({ type: CreateTerminalRequest })
  @ApiCreatedResponse({ type: GetTerminalResponse })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Post()
  @Role(UserRole.Operations)
  async run(
    @UuidParam('airportId') airportId: string,
    @Body() body: CreateTerminalRequest,
  ): Promise<GetTerminalResponse> {
    const terminalId = v4();

    const command = new CreateTerminalCommand(airportId, terminalId, body);
    await this.commandBus.execute(command);

    const query = new GetTerminalByIdQuery(airportId, terminalId);
    return this.queryBus.execute(query);
  }
}
