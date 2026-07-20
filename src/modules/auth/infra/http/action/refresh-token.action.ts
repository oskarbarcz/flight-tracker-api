import { Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { AuthService } from '../../../service/auth.service';
import { SignInRequest, SignInResponse } from '../request/sign-in.dto';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { AuthorizedRequest } from '../../../../../core/http/request/authorized.request';

@ApiTags('auth')
@Controller('/api/v1/auth')
export class RefreshTokenAction {
  constructor(private readonly authService: AuthService) {}

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
}
