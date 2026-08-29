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
import { GetMyCitiesResponse } from '../../../model/statistics.model';
import { GetMyCitiesQuery } from '../../../application/query/get-my-cities.query';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { AuthorizedRequest } from '../../../../../core/http/request/authorized.request';
import { UserAwareCacheInterceptor } from '../../../../../core/cache/user-aware-cache.interceptor';
import { CACHE_KEYS } from '../../../../../core/cache/cache.key';

@ApiTags('statistics')
@Controller('/api/v1/user')
@UseInterceptors(UserAwareCacheInterceptor)
export class GetMyCitiesAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: 'Get every city visited, oldest first visit first',
  })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({ type: GetMyCitiesResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @CacheKey(CACHE_KEYS.STATS_CITIES)
  @Get('/me/stats/cities')
  run(@Req() request: AuthorizedRequest): Promise<GetMyCitiesResponse> {
    const query = new GetMyCitiesQuery(request.user.sub);
    return this.queryBus.execute(query);
  }
}
