import { Controller, Get, Req } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetDiscordServerMembershipQuery } from '../../../application/query/get-discord-server-membership.query';
import { DiscordServerMembershipResponse } from '../request/discord-sign-in.dto';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { AuthorizedRequest } from '../../../../../core/http/request/authorized.request';

@ApiTags('user')
@Controller('/api/v1/user/me')
export class GetDiscordServerMembershipAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: 'Check whether the linked Discord account is in the server',
    description:
      'Asks Discord directly, so call it from an account screen rather than on ' +
      'every page load. Briefing direct messages can only reach somebody who ' +
      'shares the server with the app, which makes membership a precondition ' +
      'rather than a detail. Membership that cannot be determined is reported ' +
      'as `unknown` and never as `not_member`.',
  })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({ type: DiscordServerMembershipResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @Get('/discord/server-membership')
  async getDiscordServerMembership(
    @Req() req: AuthorizedRequest,
  ): Promise<DiscordServerMembershipResponse> {
    const query = new GetDiscordServerMembershipQuery(req.user.sub);

    return { status: await this.queryBus.execute(query) };
  }
}
