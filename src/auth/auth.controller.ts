import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInRequest, SignInResponse } from './dto/sign-in.dto';
import { SkipAuth } from './decorator/skip-auth.decorator';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { GenericBadRequestResponse } from '../common/response/bad-request.response';
import { UnauthorizedResponse } from '../common/response/unauthorized.response';

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
  signIn(@Body() body: SignInRequest) {
    return this.authService.signIn(body.email, body.password);
  }
}
