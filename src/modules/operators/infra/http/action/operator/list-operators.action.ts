import { Controller, Get, Query, Req, UseInterceptors } from '@nestjs/common';
import { CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { CACHE_KEYS } from '../../../../../../core/cache/cache.key';
import {
  OperatorListCacheInterceptor,
  operatorListCacheTtl,
} from '../../../../../../core/cache/operator-list-cache.interceptor';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Operator } from '../../../../model/operator.model';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { AuthorizedRequest } from '../../../../../../core/http/request/authorized.request';
import { QueryBus } from '@nestjs/cqrs';
import { ListAllOperatorsQuery } from '../../../../application/query/list-all-operators.query';
import { ListRecentOperatorsQuery } from '../../../../application/query/list-recent-operators.query';
import { OperatorListFilters } from '../../request/operator.request';

@ApiTags('operator')
@Controller('/api/v1/operator')
export class ListOperatorsAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'Retrieve all operators' })
  @ApiBearerAuth('jwt')
  @ApiQuery({
    name: 'recent-only',
    description:
      'Return at most four operators the caller most recently flew or scheduled a flight for, newest first, instead of the full list',
    type: 'boolean',
    required: false,
  })
  @ApiOkResponse({ type: Operator, isArray: true })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @UseInterceptors(OperatorListCacheInterceptor)
  @CacheKey(CACHE_KEYS.OPERATORS_LIST)
  @CacheTTL(operatorListCacheTtl)
  @Get()
  findAll(
    @Req() request: AuthorizedRequest,
    @Query() filters: OperatorListFilters,
  ): Promise<Operator[]> {
    if (filters['recent-only']) {
      const recentQuery = new ListRecentOperatorsQuery(request.user.sub);
      return this.queryBus.execute(recentQuery);
    }

    const query = new ListAllOperatorsQuery();
    return this.queryBus.execute(query);
  }
}
