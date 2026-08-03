import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiAcceptedResponse,
  ApiBadRequestResponse,
  ApiBody,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RequestPasswordResetCommand } from '../../../application/command/request-password-reset.command';
import { RequestPasswordResetDto } from '../request/request-password-reset.dto';
import { GenericBadRequestResponse } from '../../../../../core/http/response/bad-request.response';
import { SkipAuth } from '../../../../../core/http/auth/decorator/skip-auth.decorator';

@ApiTags('auth')
@Controller('/api/v1/auth')
export class RequestPasswordResetAction {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({
    summary: 'Request a password reset link',
    description:
      'Answers the same way whether or not the address belongs to an account, ' +
      'so it cannot be used to discover who has one.',
  })
  @ApiBody({ type: RequestPasswordResetDto })
  @ApiAcceptedResponse()
  @ApiBadRequestResponse({
    type: GenericBadRequestResponse<RequestPasswordResetDto>,
  })
  @SkipAuth()
  @Post('/reset-password')
  @HttpCode(HttpStatus.ACCEPTED)
  async run(@Body() body: RequestPasswordResetDto): Promise<void> {
    const command = new RequestPasswordResetCommand(body.email);

    await this.commandBus.execute(command);
  }
}
