import { Controller, Get, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { DiscordSettings } from '../../../model/discord-settings.model';
import { GetUserDiscordSettingsQuery } from '../../../application/query/get-user-discord-settings.query';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { AuthorizedRequest } from '../../../../../core/http/request/authorized.request';

@ApiTags('user')
@Controller('/api/v1/user')
export class GetDiscordSettingsAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: 'Get own Discord settings',
    description:
      'Returns how the signed-in user is served over Discord. Available regardless of whether a Discord account is linked.',
  })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({ type: DiscordSettings })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @Get('/me/discord-settings')
  async run(@Req() request: AuthorizedRequest): Promise<DiscordSettings> {
    const query = new GetUserDiscordSettingsQuery(request.user.sub);

    return this.queryBus.execute(query);
  }
}
