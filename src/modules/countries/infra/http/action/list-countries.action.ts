import { Controller, Get, UseInterceptors } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { QueryBus } from '@nestjs/cqrs';
import { CacheableInterceptor } from '../../../../../core/cache/cacheable.interceptor';
import { GetCountriesResponse } from '../../../model/country.model';
import { ListCountriesQuery } from '../../../application/query/list-countries.query';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { CACHE_KEYS, CACHE_TTL_MS } from '../../../../../core/cache/cache.key';

@ApiTags('country')
@Controller('api/v1/country')
export class ListCountriesAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'List all recognised countries' })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({ type: GetCountriesResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @UseInterceptors(CacheableInterceptor)
  @CacheKey(CACHE_KEYS.COUNTRIES_LIST)
  @CacheTTL(CACHE_TTL_MS.COUNTRIES)
  @Get()
  async findAll(): Promise<GetCountriesResponse> {
    const query = new ListCountriesQuery();
    return this.queryBus.execute(query);
  }
}
