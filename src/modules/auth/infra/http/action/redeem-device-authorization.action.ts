import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiAcceptedResponse,
  ApiBadRequestResponse,
  ApiBody,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { SkipAuth } from '../../../../../core/http/auth/decorator/skip-auth.decorator';
import { GenericBadRequestResponse } from '../../../../../core/http/response/bad-request.response';
import { ForbiddenResponse } from '../../../../../core/http/response/forbidden.response';
import { GenericNotFoundResponse } from '../../../../../core/http/response/not-found.response';
import {
  DeviceTokenResult,
  RedeemDeviceAuthorizationCommand,
} from '../../../application/command/redeem-device-authorization.command';
import {
  DeviceAuthorizationPending,
  DeviceAuthorizationStatus,
} from '../../../model/device-authorization.model';
import { RedeemDeviceAuthorizationRequest } from '../request/device-authorization.dto';
import { SignInResponse } from '../request/sign-in.dto';

@ApiTags('auth')
@Controller('/api/v1/auth')
export class RedeemDeviceAuthorizationAction {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({
    summary: 'Collect the tokens of an approved device sign-in',
    description:
      'Answers `202` until the user decides, then `200` with Transponder tokens once. ' +
      'A declined sign-in answers `403` once; after that, and after the codes expire, it answers `404`.',
  })
  @ApiBody({ type: RedeemDeviceAuthorizationRequest })
  @ApiOkResponse({ type: SignInResponse })
  @ApiAcceptedResponse({ type: DeviceAuthorizationPending })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @SkipAuth()
  @Post('/device/token')
  @HttpCode(HttpStatus.OK)
  async run(
    @Body() body: RedeemDeviceAuthorizationRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<SignInResponse | DeviceAuthorizationPending> {
    const command = new RedeemDeviceAuthorizationCommand(body.deviceCode);
    const result: DeviceTokenResult = await this.commandBus.execute(command);

    if (result.status === DeviceAuthorizationStatus.Pending) {
      response.status(HttpStatus.ACCEPTED);

      return { status: result.status };
    }

    return result.tokens;
  }
}
