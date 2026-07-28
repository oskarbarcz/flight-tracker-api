import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { AuthService } from '../../../service/auth.service';
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

@ApiTags('auth')
@Controller('/api/v1/auth')
export class LinkGoogleAccountAction {
  constructor(private readonly authService: AuthService) {}

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
  @Post('/google/link')
  @HttpCode(HttpStatus.NO_CONTENT)
  async linkGoogleAccount(
    @Req() req: AuthorizedRequest,
    @Body() body: GoogleSignInRequest,
  ): Promise<void> {
    await this.authService.linkGoogleAccount(req.user.sub, body.idToken);
  }
}
