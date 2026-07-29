import { Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { SignOutCommand } from '../../../application/command/sign-out.command';
import {
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { AuthorizedRequest } from '../../../../../core/http/request/authorized.request';

@ApiTags('auth')
@Controller('/api/v1/auth')
export class SignOutAction {
  constructor(private readonly commandBus: CommandBus) {}

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
    const command = new SignOutCommand(req.user.session);

    await this.commandBus.execute(command);
  }
}
