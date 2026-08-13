import { Controller, Get, HttpStatus, Req, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import type { Response } from 'express';
import { DiscordPresence } from '../../../model/discord-presence.model';
import { GetDiscordPresenceQuery } from '../../../application/query/get-discord-presence.query';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { AuthorizedRequest } from '../../../../../core/http/request/authorized.request';

@ApiTags('user')
@Controller('/api/v1/user')
export class GetDiscordPresenceAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: 'Get own Discord rich presence',
    description:
      'Returns the Discord activity the signed-in user currently wants published, for the companion client that writes it to the Discord app on their machine. Answers no content when rich presence is off or the user is not on a flight.',
  })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({ type: DiscordPresence })
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @Get('/me/discord-presence')
  async run(
    @Req() request: AuthorizedRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<DiscordPresence | undefined> {
    const query = new GetDiscordPresenceQuery(request.user.sub);
    const presence = await this.queryBus.execute(query);

    if (presence === null) {
      response.status(HttpStatus.NO_CONTENT);

      return undefined;
    }

    return presence;
  }
}
