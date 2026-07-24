import { Controller, Get, Query, Req, UseInterceptors } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { CacheTTL } from '@nestjs/cache-manager';
import { GetActivityResponse } from '../../../model/statistics.model';
import { GetActivityQuery } from '../../../application/query/get-activity.query';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { AuthorizedRequest } from '../../../../../core/http/request/authorized.request';
import { PeriodStatsCacheInterceptor } from '../../../../../core/cache/period-stats-cache.interceptor';
import { CACHE_TTL_MS } from '../../../../../core/cache/cache.key';
import { InvalidActivityRangeError } from '../../../model/error/statistics.error';

const DEFAULT_RANGE_DAYS = 364;

@ApiTags('statistics')
@Controller('/api/v1/user')
@UseInterceptors(PeriodStatsCacheInterceptor)
export class GetMyActivityAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'Get per-day activity heatmap series' })
  @ApiBearerAuth('jwt')
  @ApiQuery({ name: 'from', required: false, example: '2025-07-23' })
  @ApiQuery({ name: 'to', required: false, example: '2026-07-23' })
  @ApiOkResponse({ type: GetActivityResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @CacheTTL(CACHE_TTL_MS.STATS_ACTIVITY)
  @Get('/me/stats/activity')
  run(
    @Req() request: AuthorizedRequest,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<GetActivityResponse> {
    const toDate = this.parse(to, new Date());
    const fromDate = this.parse(from, this.defaultFrom(toDate));

    const query = new GetActivityQuery(request.user.sub, fromDate, toDate);
    return this.queryBus.execute(query);
  }

  private parse(value: string | undefined, fallback: Date): Date {
    if (!value) {
      return fallback;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      throw new InvalidActivityRangeError();
    }

    return parsed;
  }

  private defaultFrom(to: Date): Date {
    const from = new Date(to);
    from.setUTCDate(from.getUTCDate() - DEFAULT_RANGE_DAYS);
    return from;
  }
}
