import { Controller, Get, UseInterceptors } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { QueryBus } from '@nestjs/cqrs';
import { AircraftHoldLayout } from '../../../model/hold-layout.model';
import { ListHoldLayoutsQuery } from '../../../application/query/list-hold-layouts.query';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { CACHE_KEYS, CACHE_TTL_MS } from '../../../../../core/cache/cache.key';

@ApiTags('cargo hold')
@Controller('api/v1/cargo-hold')
export class ListHoldLayoutsAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: 'List the hold configurations of every curated airframe type',
    description:
      'Curated reference data. Hold volumes and ULD counts follow published airframe figures where those exist; per-compartment weights are derived from the positions a compartment holds, since manufacturers do not publish them. Position designators are a convention of this system, not a published designation.',
  })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({ type: AircraftHoldLayout, isArray: true })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @UseInterceptors(CacheInterceptor)
  @CacheKey(CACHE_KEYS.CARGO_HOLDS_LIST)
  @CacheTTL(CACHE_TTL_MS.CARGO_HOLDS)
  @Get()
  async findAll(): Promise<AircraftHoldLayout[]> {
    const query = new ListHoldLayoutsQuery();
    return this.queryBus.execute(query);
  }
}
