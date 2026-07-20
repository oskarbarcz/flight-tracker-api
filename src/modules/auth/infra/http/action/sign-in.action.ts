import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from '../../../service/auth.service';
import { SignInRequest, SignInResponse } from '../request/sign-in.dto';
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
export class SignInAction {
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
}
