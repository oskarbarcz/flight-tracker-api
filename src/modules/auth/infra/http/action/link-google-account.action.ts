import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { LinkGoogleAccountCommand } from '../../../application/command/link-google-account.command';
import { GoogleSignInRequest } from '../request/google-sign-in.dto';
import {
  ApiBadRequestResponse,
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
export class LinkGoogleAccountAction {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({
    summary: 'Link a Google account to the signed-in user',
    description:
      'Enables `POST /api/v1/auth/google` for the signed-in user. ' +
      'A user can hold at most one linked Google account, and a Google ' +
      'account can be linked to at most one user.',
  })
  @ApiBody({ type: GoogleSignInRequest })
  @ApiNoContentResponse()
  @ApiBadRequestResponse({
    description: 'Input validation failed',
    type: GenericBadRequestResponse<void>,
  })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiConflictResponse({
    description:
      'User already linked a Google account, or this Google account belongs to another user',
    type: GenericConflictResponse,
  })
  @Post('/link-google-account')
  @HttpCode(HttpStatus.NO_CONTENT)
  async linkGoogleAccount(
    @Req() req: AuthorizedRequest,
    @Body() body: GoogleSignInRequest,
  ): Promise<void> {
    const command = new LinkGoogleAccountCommand(req.user.sub, body.idToken);

    await this.commandBus.execute(command);
  }
}
