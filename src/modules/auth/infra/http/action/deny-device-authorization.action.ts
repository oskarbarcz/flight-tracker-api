import {
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthorizedRequest } from '../../../../../core/http/request/authorized.request';
import { ForbiddenResponse } from '../../../../../core/http/response/forbidden.response';
import { GenericNotFoundResponse } from '../../../../../core/http/response/not-found.response';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { DecideDeviceAuthorizationCommand } from '../../../application/command/decide-device-authorization.command';
import { DeviceAuthorizationStatus } from '../../../model/device-authorization.model';

@ApiTags('auth')
@Controller('/api/v1/auth')
export class DenyDeviceAuthorizationAction {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({ summary: 'Decline a device sign-in' })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'userCode',
    description: 'The code the device shows. Case and the dash do not matter.',
    example: 'BCDF-GHJK',
  })
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Post('/device/:userCode/deny')
  @HttpCode(HttpStatus.NO_CONTENT)
  async run(
    @Param('userCode') userCode: string,
    @Req() request: AuthorizedRequest,
  ): Promise<void> {
    const command = new DecideDeviceAuthorizationCommand(
      userCode,
      DeviceAuthorizationStatus.Denied,
      request.user.sub,
    );

    await this.commandBus.execute(command);
  }
}
