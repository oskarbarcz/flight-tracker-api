import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { UnlinkDiscordAccountCommand } from '../../../application/command/unlink-discord-account.command';
import { UnlinkDiscordAccountRequest } from '../request/discord-sign-in.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiNoContentResponse,
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
export class UnlinkDiscordAccountAction {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({
    summary: 'Unlink the Discord account of the signed-in user',
    description:
      'Disables `POST /api/v1/auth/discord` for the signed-in user and stops ' +
      'briefing direct messages. Rejected when the account has no password, ' +
      'since that would leave no way to sign in at all — ' +
      '`POST /api/v1/user/me/set-password` first. Membership of the Discord ' +
      'server is left untouched, and a Discord account can be linked again ' +
      'afterwards.',
  })
  @ApiBearerAuth('jwt')
  @ApiBody({ type: UnlinkDiscordAccountRequest })
  @ApiNoContentResponse()
  @ApiBadRequestResponse({
    type: GenericBadRequestResponse<UnlinkDiscordAccountRequest>,
  })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiConflictResponse({
    description:
      'No Discord account is linked, or the account has no password to sign in with afterwards',
    type: GenericConflictResponse,
  })
  @Post('/unlink-discord-account')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unlinkDiscordAccount(
    @Req() req: AuthorizedRequest,
    @Body() body: UnlinkDiscordAccountRequest,
  ): Promise<void> {
    const command = new UnlinkDiscordAccountCommand(
      req.user.sub,
      body.currentPassword,
    );

    await this.commandBus.execute(command);
  }
}
