import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInRequest, SignInResponse } from './dto/sign-in.dto';
import { SkipAuth } from './decorator/skip-auth.decorator';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { GenericBadRequestResponse } from '../common/response/bad-request.response';
import { UnauthorizedResponse } from '../common/response/unauthorized.response';
import { AuthorizedRequest } from '../common/request/authorized.request';

@ApiTags('auth')
@Controller('/api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Get JWT authorization token' })
  @ApiBody({ type: SignInRequest })
  @ApiOkResponse({
    description: 'Credentials are OK',
    type: SignInResponse,
  })
  @ApiBadRequestResponse({
    description: 'Input validation failed',
    type: GenericBadRequestResponse<SignInResponse>,
  })
  @ApiUnauthorizedResponse({
    description: 'Credentials are invalid',
    type: UnauthorizedResponse,
  })
  @SkipAuth()
  @Post('/sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() body: SignInRequest): Promise<SignInResponse> {
    return this.authService.signIn(body.email, body.password);
  }

  @ApiOperation({ summary: 'Get JWT authorization token' })
  @ApiBody({ type: SignInRequest })
  @ApiOkResponse({
    description: 'Credentials are OK',
    type: SignInResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'JWT refresh token is invalid, outdated or missing',
    type: UnauthorizedResponse,
  })
  @Post('/refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Req() req: AuthorizedRequest): Promise<SignInResponse> {
    return this.authService.refreshToken(req.user.sub, req.user.session);
  }

  @ApiOperation({ summary: 'Invalidate JWT refresh token' })
  @ApiNoContentResponse({
    description: 'JWT refresh token was invalidated successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @Post('/sign-out')
  @HttpCode(HttpStatus.NO_CONTENT)
  async signOut(@Req() req: AuthorizedRequest): Promise<void> {
    await this.authService.signOutFromSession(req.user.session);
  }
}
