import { UnauthorizedException } from '@nestjs/common';
import { JwtTokenType } from './jwt-user.dto';

export class CannotUseTokenTypeError extends UnauthorizedException {
  constructor(type: JwtTokenType) {
    super(`Cannot use ${type} token for this request.`);
  }
}
