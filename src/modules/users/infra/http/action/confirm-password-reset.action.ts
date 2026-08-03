import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ConfirmPasswordResetCommand } from '../../../application/command/confirm-password-reset.command';
import { ConfirmPasswordResetDto } from '../request/confirm-password-reset.dto';
import { GenericBadRequestResponse } from '../../../../../core/http/response/bad-request.response';
import { SkipAuth } from '../../../../../core/http/auth/decorator/skip-auth.decorator';

@ApiTags('auth')
@Controller('/api/v1/auth')
export class ConfirmPasswordResetAction {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({ summary: 'Set a new password with a reset link' })
  @ApiBody({ type: ConfirmPasswordResetDto })
  @ApiNoContentResponse()
  @ApiBadRequestResponse({
    type: GenericBadRequestResponse<ConfirmPasswordResetDto>,
  })
  @SkipAuth()
  @Post('/reset-password/confirm')
  @HttpCode(HttpStatus.NO_CONTENT)
  async run(@Body() body: ConfirmPasswordResetDto): Promise<void> {
    const command = new ConfirmPasswordResetCommand(
      body.token,
      body.newPassword,
    );

    await this.commandBus.execute(command);
  }
}
