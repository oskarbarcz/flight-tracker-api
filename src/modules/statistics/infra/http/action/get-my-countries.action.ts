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
import { GetMyCountriesResponse } from '../../../model/statistics.model';
import { GetMyCountriesQuery } from '../../../application/query/get-my-countries.query';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { AuthorizedRequest } from '../../../../../core/http/request/authorized.request';
import { UserAwareCacheInterceptor } from '../../../../../core/cache/user-aware-cache.interceptor';
import { CACHE_KEYS } from '../../../../../core/cache/cache.key';

@ApiTags('statistics')
@Controller('/api/v1/user')
@UseInterceptors(UserAwareCacheInterceptor)
export class GetMyCountriesAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: 'Get every country visited, oldest first visit first',
  })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({ type: GetMyCountriesResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @CacheKey(CACHE_KEYS.STATS_COUNTRIES)
  @Get('/me/stats/countries')
  run(@Req() request: AuthorizedRequest): Promise<GetMyCountriesResponse> {
    const query = new GetMyCountriesQuery(request.user.sub);
    return this.queryBus.execute(query);
  }
}
