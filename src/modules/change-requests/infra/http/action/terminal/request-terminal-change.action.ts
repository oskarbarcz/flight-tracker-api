import { Body, Controller, Post, Req } from '@nestjs/common';
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
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UserRole } from '../../../../../users/model/user-role';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { AuthorizedRequest } from '../../../../../../core/http/request/authorized.request';
import { GenericBadRequestResponse } from '../../../../../../core/http/response/bad-request.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { RequestTerminalChangeRequest } from '../../request/change-request.dto';
import {
  ChangeRequestResource,
  ChangeRequestWithFields,
} from '../../../../model/change-request.model';
import { AssertTerminalExistsQuery } from '../../../../../airports/application/assert/assert-terminal-exists.query';
import { SubmitChangeRequestCommand } from '../../../../application/command/submit-change-request.command';
import { GetChangeRequestByIdQuery } from '../../../../application/query/get-change-request-by-id.query';

@ApiTags('airport terminal')
@Controller(
  'api/v1/airport/:airportId/terminal/:terminalId/request-data-change',
)
export class RequestTerminalChangeAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Propose a change to a terminal',
    description:
      'Files the proposed values for review. The terminal is not changed until a reviewer accepts the request. ' +
      '**NOTE:** This endpoint is only available for users with `cabin crew` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'airportId', description: 'Airport unique identifier' })
  @ApiParam({ name: 'terminalId', description: 'Terminal unique identifier' })
  @ApiBody({ type: RequestTerminalChangeRequest })
  @ApiCreatedResponse({ type: ChangeRequestWithFields })
  @ApiBadRequestResponse({
    type: GenericBadRequestResponse<RequestTerminalChangeRequest>,
  })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @ApiUnprocessableEntityResponse({
    description: 'Every proposed value is equal to the value held now.',
  })
  @Post()
  @Role(UserRole.CabinCrew)
  async run(
    @UuidParam('airportId') airportId: string,
    @UuidParam('terminalId') terminalId: string,
    @Req() request: AuthorizedRequest,
    @Body() body: RequestTerminalChangeRequest,
  ): Promise<ChangeRequestWithFields> {
    const assertion = new AssertTerminalExistsQuery(airportId, terminalId);
    await this.queryBus.execute(assertion);

    const command = new SubmitChangeRequestCommand(
      ChangeRequestResource.terminal,
      terminalId,
      body,
      request.user.sub,
    );
    const changeRequestId = await this.commandBus.execute(command);

    const query = new GetChangeRequestByIdQuery(changeRequestId);
    return this.queryBus.execute(query);
  }
}
