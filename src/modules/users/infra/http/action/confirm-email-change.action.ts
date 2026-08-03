import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ConfirmEmailChangeCommand } from '../../../application/command/confirm-email-change.command';
import { ConfirmEmailChangeDto } from '../request/confirm-email-change.dto';
import { GenericBadRequestResponse } from '../../../../../core/http/response/bad-request.response';
import { GenericConflictResponse } from '../../../../../core/http/response/conflict.response';
import { SkipAuth } from '../../../../../core/http/auth/decorator/skip-auth.decorator';

@ApiTags('user')
@Controller('/api/v1/user/me')
export class ConfirmEmailChangeAction {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({ summary: 'Confirm a requested email address change' })
  @ApiBody({ type: ConfirmEmailChangeDto })
  @ApiNoContentResponse()
  @ApiBadRequestResponse({
    type: GenericBadRequestResponse<ConfirmEmailChangeDto>,
  })
  @ApiConflictResponse({
    description: 'Address was taken by another account in the meantime',
    type: GenericConflictResponse,
  })
  @SkipAuth()
  @Post('/change-email/confirm')
  @HttpCode(HttpStatus.NO_CONTENT)
  async run(@Body() body: ConfirmEmailChangeDto): Promise<void> {
    const command = new ConfirmEmailChangeCommand(body.token);

    await this.commandBus.execute(command);
  }
}
