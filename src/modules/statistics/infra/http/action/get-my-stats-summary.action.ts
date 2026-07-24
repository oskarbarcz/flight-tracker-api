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
import { GetUserStatsSummaryResponse } from '../../../model/statistics.model';
import { GetUserStatsSummaryQuery } from '../../../application/query/get-user-stats-summary.query';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { AuthorizedRequest } from '../../../../../core/http/request/authorized.request';
import { UserAwareCacheInterceptor } from '../../../../../core/cache/user-aware-cache.interceptor';
import { CACHE_KEYS } from '../../../../../core/cache/cache.key';

@ApiTags('statistics')
@Controller('/api/v1/user')
@UseInterceptors(UserAwareCacheInterceptor)
export class GetMyStatsSummaryAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: 'Get lifetime stats overview (totals, records, breakdowns)',
  })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({ type: GetUserStatsSummaryResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @CacheKey(CACHE_KEYS.STATS_SUMMARY)
  @Get('/me/stats/summary')
  run(@Req() request: AuthorizedRequest): Promise<GetUserStatsSummaryResponse> {
    const query = new GetUserStatsSummaryQuery(request.user.sub);
    return this.queryBus.execute(query);
  }
}
