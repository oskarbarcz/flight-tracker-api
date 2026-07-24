import { Controller, Get, Req, UseInterceptors } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { CacheKey } from '@nestjs/cache-manager';
import { GetUserStatsResponse } from '../../../model/statistics.model';
import { GetUserLifetimeStatsQuery } from '../../../application/query/get-user-lifetime-stats.query';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { AuthorizedRequest } from '../../../../../core/http/request/authorized.request';
import { UserAwareCacheInterceptor } from '../../../../../core/cache/user-aware-cache.interceptor';
import { CACHE_KEYS } from '../../../../../core/cache/cache.key';

@ApiTags('statistics')
@Controller('/api/v1/user')
@UseInterceptors(UserAwareCacheInterceptor)
export class GetMyStatsAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'Get lifetime stats totals' })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({ type: GetUserStatsResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @CacheKey(CACHE_KEYS.USER_STATS)
  @Get('/me/stats')
  run(@Req() request: AuthorizedRequest): Promise<GetUserStatsResponse> {
    const query = new GetUserLifetimeStatsQuery(request.user.sub);
    return this.queryBus.execute(query);
  }
}
