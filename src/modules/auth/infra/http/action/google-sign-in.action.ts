import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { SignInWithGoogleCommand } from '../../../application/command/sign-in-with-google.command';
import { SignInResponse } from '../request/sign-in.dto';
import { GoogleSignInRequest } from '../request/google-sign-in.dto';
import { SkipAuth } from '../../../../../core/http/auth/decorator/skip-auth.decorator';
import {
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
export class GoogleSignInAction {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({
    summary: 'Exchange a Google ID token for JWT authorization token',
    description:
      'Only succeeds for a user who has already linked this Google account ' +
      'via `POST /api/v1/auth/google/link`. No user account is created.',
  })
  @ApiBody({ type: GoogleSignInRequest })
  @ApiOkResponse({ type: SignInResponse })
  @ApiBadRequestResponse({
    description: 'Input validation failed',
    type: GenericBadRequestResponse<SignInResponse>,
  })
  @ApiUnauthorizedResponse({
    description: 'Google token is invalid or no user is linked to it',
    type: UnauthorizedResponse,
  })
  @SkipAuth()
  @Post('/google')
  @HttpCode(HttpStatus.OK)
  async signInWithGoogle(
    @Body() body: GoogleSignInRequest,
  ): Promise<SignInResponse> {
    const command = new SignInWithGoogleCommand(body.idToken);

    return this.commandBus.execute(command);
  }
}
