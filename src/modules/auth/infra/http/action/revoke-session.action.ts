import { Controller, Delete, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthorizedRequest } from '../../../../../core/http/request/authorized.request';
import { GenericBadRequestResponse } from '../../../../../core/http/response/bad-request.response';
import { ForbiddenResponse } from '../../../../../core/http/response/forbidden.response';
import { GenericNotFoundResponse } from '../../../../../core/http/response/not-found.response';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { UuidParam } from '../../../../../core/validation/uuid.param';
import { RevokeSessionCommand } from '../../../application/command/revoke-session.command';

@ApiTags('user')
@Controller('/api/v1/user')
export class RevokeSessionAction {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({
    summary: 'Sign one of my sessions out',
    description:
      'The device keeps working until its access token expires, at most 15 minutes, and then cannot renew it.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'id', description: 'Session unique identifier' })
  @ApiNoContentResponse()
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Delete('/me/session/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async run(
    @UuidParam('id') id: string,
    @Req() request: AuthorizedRequest,
  ): Promise<void> {
    const command = new RevokeSessionCommand(request.user.sub, id);

    await this.commandBus.execute(command);
  }
}
