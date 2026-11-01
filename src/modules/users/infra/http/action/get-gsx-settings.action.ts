import { Controller, Get, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { GsxSettings } from '../../../model/gsx-settings.model';
import { GetUserGsxSettingsQuery } from '../../../application/query/get-user-gsx-settings.query';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { AuthorizedRequest } from '../../../../../core/http/request/authorized.request';
import { AllowClient } from '../../../../../core/http/auth/decorator/allow-client.decorator';
import { SessionClient } from '../../../../auth/model/session-client';

@ApiTags('user')
@Controller('/api/v1/user')
export class GetGsxSettingsAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: 'Get own GSX settings',
    description:
      'Returns how the signed-in user wants GSX to steer their flight. A client acting on the automatic boarding and deboarding settings must check that the integration is on first, because those settings keep their values while it is off.',
  })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({ type: GsxSettings })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @AllowClient(SessionClient.Transponder)
  @Get('/me/gsx-settings')
  async run(@Req() request: AuthorizedRequest): Promise<GsxSettings> {
    const query = new GetUserGsxSettingsQuery(request.user.sub);

    return this.queryBus.execute(query);
  }
}
