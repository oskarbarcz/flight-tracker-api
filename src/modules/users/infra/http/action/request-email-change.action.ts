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
  ApiAcceptedResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RequestEmailChangeCommand } from '../../../application/command/request-email-change.command';
import { RequestEmailChangeDto } from '../request/request-email-change.dto';
import { GenericBadRequestResponse } from '../../../../../core/http/response/bad-request.response';
import { GenericConflictResponse } from '../../../../../core/http/response/conflict.response';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { AuthorizedRequest } from '../../../../../core/http/request/authorized.request';

@ApiTags('user')
@Controller('/api/v1/user/me')
export class RequestEmailChangeAction {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({ summary: 'Request a change of own email address' })
  @ApiBearerAuth('jwt')
  @ApiBody({ type: RequestEmailChangeDto })
  @ApiAcceptedResponse()
  @ApiBadRequestResponse({
    type: GenericBadRequestResponse<RequestEmailChangeDto>,
  })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiConflictResponse({
    description:
      'Address belongs to another account, or the account has no password to prove',
    type: GenericConflictResponse,
  })
  @Post('/change-email')
  @HttpCode(HttpStatus.ACCEPTED)
  async run(
    @Req() request: AuthorizedRequest,
    @Body() body: RequestEmailChangeDto,
  ): Promise<void> {
    const command = new RequestEmailChangeCommand(
      request.user.sub,
      body.newEmail,
      body.currentPassword,
    );

    await this.commandBus.execute(command);
  }
}
