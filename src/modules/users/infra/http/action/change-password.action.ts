import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
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
import { ChangePasswordCommand } from '../../../application/command/change-password.command';
import { ChangePasswordDto } from '../request/change-password.dto';
import { GenericBadRequestResponse } from '../../../../../core/http/response/bad-request.response';
import { GenericConflictResponse } from '../../../../../core/http/response/conflict.response';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { AuthorizedRequest } from '../../../../../core/http/request/authorized.request';

@ApiTags('user')
@Controller('/api/v1/user/me')
export class ChangePasswordAction {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({
    summary: 'Change own password',
    description:
      'Replaces the signed-in user password once the current one is proven. ' +
      'Every other session of that user is revoked; the session performing the ' +
      'change stays valid.',
  })
  @ApiBearerAuth('jwt')
  @ApiBody({ type: ChangePasswordDto })
  @ApiNoContentResponse()
  @ApiBadRequestResponse({
    description:
      'Input validation failed, or the new password is not different',
    type: GenericBadRequestResponse<ChangePasswordDto>,
  })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiConflictResponse({
    description: 'Account signs in with Google and has no password to change',
    type: GenericConflictResponse,
  })
  @Patch('/change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async run(
    @Req() request: AuthorizedRequest,
    @Body() body: ChangePasswordDto,
  ): Promise<void> {
    const command = new ChangePasswordCommand(
      request.user.sub,
      request.user.session,
      body.currentPassword,
      body.newPassword,
    );

    await this.commandBus.execute(command);
  }
}
