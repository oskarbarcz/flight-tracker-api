import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SkipAuth } from '../../../../../core/http/auth/decorator/skip-auth.decorator';
import { GenericBadRequestResponse } from '../../../../../core/http/response/bad-request.response';
import { StartDeviceAuthorizationCommand } from '../../../application/command/start-device-authorization.command';
import { DeviceAuthorizationStart } from '../../../model/device-authorization.model';
import { SessionClient } from '../../../model/session-client';
import { StartDeviceAuthorizationRequest } from '../request/device-authorization.dto';

@ApiTags('auth')
@Controller('/api/v1/auth')
export class StartDeviceAuthorizationAction {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({
    summary: 'Start signing the Transponder in through the browser',
    description:
      'The Transponder shows `userCode` and opens `verificationUriComplete`, where the user signs in and approves it. ' +
      'It then polls `POST /api/v1/auth/device/token` every `interval` seconds until it gets its tokens. The codes expire after `expiresIn` seconds.',
  })
  @ApiBody({ type: StartDeviceAuthorizationRequest, required: false })
  @ApiCreatedResponse({ type: DeviceAuthorizationStart })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @SkipAuth()
  @Post('/device')
  @HttpCode(HttpStatus.CREATED)
  async run(
    @Body() body: StartDeviceAuthorizationRequest,
  ): Promise<DeviceAuthorizationStart> {
    const command = new StartDeviceAuthorizationCommand(
      SessionClient.Transponder,
      body.deviceName ?? null,
    );

    return this.commandBus.execute(command);
  }
}
