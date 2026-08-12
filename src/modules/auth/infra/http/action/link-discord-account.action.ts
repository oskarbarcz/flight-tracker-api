import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { LinkDiscordAccountCommand } from '../../../application/command/link-discord-account.command';
import {
  LinkDiscordAccountRequest,
  LinkDiscordAccountResponse,
} from '../request/discord-sign-in.dto';
import {
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { GenericBadRequestResponse } from '../../../../../core/http/response/bad-request.response';
import { GenericConflictResponse } from '../../../../../core/http/response/conflict.response';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { AuthorizedRequest } from '../../../../../core/http/request/authorized.request';

@ApiTags('user')
@Controller('/api/v1/user/me')
export class LinkDiscordAccountAction {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({
    summary: 'Link a Discord account to the signed-in user',
    description:
      'Enables `POST /api/v1/auth/discord` and lets the app deliver flight ' +
      'briefings by direct message. A user can hold at most one linked Discord ' +
      'account, and a Discord account can be linked to at most one user. ' +
      'Briefings can only be delivered to somebody who is also in the server, ' +
      'so `joinServer` adds the user to it — when that fails the link still ' +
      'stands and `joinOutcome` reports `failed`.',
  })
  @ApiBearerAuth('jwt')
  @ApiBody({ type: LinkDiscordAccountRequest })
  @ApiOkResponse({ type: LinkDiscordAccountResponse })
  @ApiBadRequestResponse({
    type: GenericBadRequestResponse<LinkDiscordAccountRequest>,
  })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiConflictResponse({
    description:
      'User already linked a Discord account, or this Discord account belongs to another user',
    type: GenericConflictResponse,
  })
  @ApiBadGatewayResponse({ description: 'Discord did not answer' })
  @Post('/link-discord-account')
  @HttpCode(HttpStatus.OK)
  async linkDiscordAccount(
    @Req() req: AuthorizedRequest,
    @Body() body: LinkDiscordAccountRequest,
  ): Promise<LinkDiscordAccountResponse> {
    const command = new LinkDiscordAccountCommand(
      req.user.sub,
      body.code,
      body.redirectUri,
      body.codeVerifier,
      body.joinServer ?? false,
    );

    return this.commandBus.execute(command);
  }
}
