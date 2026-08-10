import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
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
import { SetPasswordCommand } from '../../../application/command/set-password.command';
import { SetPasswordDto } from '../request/set-password.dto';
import { GenericBadRequestResponse } from '../../../../../core/http/response/bad-request.response';
import { GenericConflictResponse } from '../../../../../core/http/response/conflict.response';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { AuthorizedRequest } from '../../../../../core/http/request/authorized.request';

@ApiTags('user')
@Controller('/api/v1/user/me')
export class SetPasswordAction {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({
    summary: 'Set a first password',
    description:
      'Gives a password to an account that signs in with Google and has none, ' +
      'so it can also sign in with an email address and password. Rejected when ' +
      'the account already has a password — rotating a known one is ' +
      '`PATCH /api/v1/user/me/change-password`. Every other session of that user ' +
      'is revoked; the session performing the change stays valid.',
  })
  @ApiBearerAuth('jwt')
  @ApiBody({ type: SetPasswordDto })
  @ApiNoContentResponse()
  @ApiBadRequestResponse({
    description: 'Input validation failed',
    type: GenericBadRequestResponse<SetPasswordDto>,
  })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiConflictResponse({
    description: 'Account already has a password',
    type: GenericConflictResponse,
  })
  @Post('/set-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async run(
    @Req() request: AuthorizedRequest,
    @Body() body: SetPasswordDto,
  ): Promise<void> {
    const command = new SetPasswordCommand(
      request.user.sub,
      request.user.session,
      body.newPassword,
    );

    await this.commandBus.execute(command);
  }
}
