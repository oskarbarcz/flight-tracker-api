import { Controller, Get, Req, UseInterceptors } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { GetUserStatsResponse } from '../dto/get-user.dto';
import { UnauthorizedResponse } from '../../../core/http/response/unauthorized.response';
import { AuthorizedRequest } from '../../../core/http/request/authorized.request';
import { QueryBus } from '@nestjs/cqrs';
import { GetUserStatsQuery } from '../application/query/get-user-stats.query';
import { UserAwareCacheInterceptor } from '../../../core/cache/user-aware-cache.interceptor';
import { CacheKey } from '@nestjs/cache-manager';
import { CACHE_KEYS } from '../../../core/cache/cache.key';

@ApiTags('user')
@Controller('/api/v1/user')
@UseInterceptors(UserAwareCacheInterceptor)
export class StatsController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: 'Get user stats',
  })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({
    description: 'User stats',
    type: GetUserStatsResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @CacheKey(CACHE_KEYS.USER_STATS)
  @Get('/me/stats')
  getMyStats(@Req() request: AuthorizedRequest): Promise<GetUserStatsResponse> {
    const query = new GetUserStatsQuery(request.user.sub);
    return this.queryBus.execute(query);
  }
}
