import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { SignInWithDiscordCommand } from '../../../application/command/sign-in-with-discord.command';
import { SignInResponse } from '../request/sign-in.dto';
import { DiscordAuthorizationRequest } from '../request/discord-sign-in.dto';
import { SkipAuth } from '../../../../../core/http/auth/decorator/skip-auth.decorator';
import {
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { GenericBadRequestResponse } from '../../../../../core/http/response/bad-request.response';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';

@ApiTags('auth')
@Controller('/api/v1/auth')
export class DiscordSignInAction {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({
    summary:
      'Exchange a Discord authorization code for JWT authorization token',
    description:
      'Only succeeds for a user who has already linked this Discord account ' +
      'via `POST /api/v1/user/me/link-discord-account`. No user account is created.',
  })
  @ApiBody({ type: DiscordAuthorizationRequest })
  @ApiOkResponse({ type: SignInResponse })
  @ApiBadRequestResponse({
    type: GenericBadRequestResponse<DiscordAuthorizationRequest>,
  })
  @ApiUnauthorizedResponse({
    description: 'No user is linked to this Discord account',
    type: UnauthorizedResponse,
  })
  @ApiBadGatewayResponse({ description: 'Discord did not answer' })
  @SkipAuth()
  @Post('/discord')
  @HttpCode(HttpStatus.OK)
  async signInWithDiscord(
    @Body() body: DiscordAuthorizationRequest,
  ): Promise<SignInResponse> {
    const command = new SignInWithDiscordCommand(
      body.code,
      body.redirectUri,
      body.codeVerifier,
    );

    return this.commandBus.execute(command);
  }
}
