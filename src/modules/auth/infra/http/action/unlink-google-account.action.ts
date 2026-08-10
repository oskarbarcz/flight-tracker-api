import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { UnlinkGoogleAccountCommand } from '../../../application/command/unlink-google-account.command';
import { UnlinkGoogleAccountRequest } from '../request/unlink-google-account.dto';
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
import { GenericBadRequestResponse } from '../../../../../core/http/response/bad-request.response';
import { GenericConflictResponse } from '../../../../../core/http/response/conflict.response';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { AuthorizedRequest } from '../../../../../core/http/request/authorized.request';

@ApiTags('user')
@Controller('/api/v1/user/me')
export class UnlinkGoogleAccountAction {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({
    summary: 'Unlink the Google account of the signed-in user',
    description:
      'Disables `POST /api/v1/auth/google` for the signed-in user, leaving the ' +
      'email address and password as the only way in. Rejected when the account ' +
      'has no password, since that would leave no way to sign in at all — ' +
      '`POST /api/v1/user/me/set-password` first. Open sessions stay valid, and ' +
      'a Google account can be linked again afterwards.',
  })
  @ApiBearerAuth('jwt')
  @ApiBody({ type: UnlinkGoogleAccountRequest })
  @ApiNoContentResponse()
  @ApiBadRequestResponse({
    description: 'Input validation failed',
    type: GenericBadRequestResponse<UnlinkGoogleAccountRequest>,
  })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiConflictResponse({
    description:
      'No Google account is linked, or the account has no password to sign in with afterwards',
    type: GenericConflictResponse,
  })
  @Post('/unlink-google-account')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unlinkGoogleAccount(
    @Req() req: AuthorizedRequest,
    @Body() body: UnlinkGoogleAccountRequest,
  ): Promise<void> {
    const command = new UnlinkGoogleAccountCommand(
      req.user.sub,
      body.currentPassword,
    );

    await this.commandBus.execute(command);
  }
}
