import { Controller, Get, Req } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthorizedRequest } from '../../../../../core/http/request/authorized.request';
import { ForbiddenResponse } from '../../../../../core/http/response/forbidden.response';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { ListSessionsQuery } from '../../../application/query/list-sessions.query';
import { Session } from '../../../model/session.model';

@ApiTags('user')
@Controller('/api/v1/user')
export class ListSessionsAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: 'List the places I am signed in',
    description: 'Most recently used first.',
  })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({ type: Session, isArray: true })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @Get('/me/session')
  async run(@Req() request: AuthorizedRequest): Promise<Session[]> {
    const query = new ListSessionsQuery(request.user.sub, request.user.session);

    return this.queryBus.execute(query);
  }
}
