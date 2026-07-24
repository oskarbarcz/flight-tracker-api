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
import { GetPeriodStatsResponse } from '../../../model/statistics.model';
import { GetPeriodStatsQuery } from '../../../application/query/get-period-stats.query';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { AuthorizedRequest } from '../../../../../core/http/request/authorized.request';
import { PeriodStatsCacheInterceptor } from '../../../../../core/cache/period-stats-cache.interceptor';
import { CACHE_KEYS } from '../../../../../core/cache/cache.key';

@ApiTags('statistics')
@Controller('/api/v1/user')
@UseInterceptors(PeriodStatsCacheInterceptor)
export class GetMyPeriodStatsAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: 'Get calendar-period stats (this/last week, month, year)',
  })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({ type: GetPeriodStatsResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @CacheKey(CACHE_KEYS.STATS_PERIODS)
  @Get('/me/stats/periods')
  run(@Req() request: AuthorizedRequest): Promise<GetPeriodStatsResponse> {
    const query = new GetPeriodStatsQuery(request.user.sub, new Date());
    return this.queryBus.execute(query);
  }
}
