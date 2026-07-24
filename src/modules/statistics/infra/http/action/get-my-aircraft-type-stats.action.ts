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
import { GetAircraftTypeStatsResponse } from '../../../model/statistics.model';
import { GetAircraftTypeStatsQuery } from '../../../application/query/get-aircraft-type-stats.query';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { AuthorizedRequest } from '../../../../../core/http/request/authorized.request';
import { UserAwareCacheInterceptor } from '../../../../../core/cache/user-aware-cache.interceptor';
import { CACHE_KEYS } from '../../../../../core/cache/cache.key';

@ApiTags('statistics')
@Controller('/api/v1/user')
@UseInterceptors(UserAwareCacheInterceptor)
export class GetMyAircraftTypeStatsAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'Get stats per aircraft type' })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({ type: GetAircraftTypeStatsResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @CacheKey(CACHE_KEYS.STATS_TYPES)
  @Get('/me/stats/aircraft-types')
  run(
    @Req() request: AuthorizedRequest,
  ): Promise<GetAircraftTypeStatsResponse> {
    const query = new GetAircraftTypeStatsQuery(request.user.sub);
    return this.queryBus.execute(query);
  }
}
