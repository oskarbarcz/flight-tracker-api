import { Controller, Get, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ForbiddenResponse } from '../../../../../core/http/response/forbidden.response';
import { GenericNotFoundResponse } from '../../../../../core/http/response/not-found.response';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { GetDeviceAuthorizationQuery } from '../../../application/query/get-device-authorization.query';
import { DeviceAuthorizationDetails } from '../../../model/device-authorization.model';

@ApiTags('auth')
@Controller('/api/v1/auth')
export class GetDeviceAuthorizationAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: 'Show a device sign-in waiting for approval',
    description:
      'Only sign-ins nobody has approved or declined yet are found, until their codes expire.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'userCode',
    description: 'The code the device shows. Case and the dash do not matter.',
    example: 'BCDF-GHJK',
  })
  @ApiOkResponse({ type: DeviceAuthorizationDetails })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Get('/device/:userCode')
  async run(
    @Param('userCode') userCode: string,
  ): Promise<DeviceAuthorizationDetails> {
    const query = new GetDeviceAuthorizationQuery(userCode);

    return this.queryBus.execute(query);
  }
}
