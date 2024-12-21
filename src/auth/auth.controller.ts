import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInRequest } from './dto/sign-in.dto';
import { SkipAuth } from './decorator/skip-auth.decorator';

@Controller('/api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @SkipAuth()
  @Post('/sign-in')
  @HttpCode(HttpStatus.OK)
  signIn(@Body() body: SignInRequest) {
    return this.authService.signIn(body.email, body.password);
  }
}
