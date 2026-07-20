import { Controller, Get, UseInterceptors } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { UserRole } from 'prisma/client/client';
import { PerFlightCacheInterceptor } from '../../../../../../core/cache/per-flight-cache.interceptor';
import {
  CACHE_TTL_MS,
  FLIGHT_CACHE_RESOURCE,
} from '../../../../../../core/cache/cache.key';
import { GetDelayRequestResponse } from '../../request/delay.dto';
import { GenericBadRequestResponse } from '../../../../../../core/http/response/bad-request.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { GetDelayRequestQuery } from '../../../../application/query/delay/get-delay-request.query';

@ApiTags('flight delay')
@Controller('api/v1/flight/:flightId/delay')
export class GetDelayRequestAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: 'Get the delay request for a flight',
    description:
      '**NOTE:** This endpoint is only available for users with `cabin crew` or `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'flightId',
    description: 'Flight unique identifier',
  })
  @ApiOkResponse({ type: GetDelayRequestResponse })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Get()
  @Role(UserRole.CabinCrew, UserRole.Operations)
  @UseInterceptors(PerFlightCacheInterceptor)
  @CacheKey(FLIGHT_CACHE_RESOURCE.delay)
  @CacheTTL(CACHE_TTL_MS.DELAY)
  public async run(
    @UuidParam('flightId') flightId: string,
  ): Promise<GetDelayRequestResponse> {
    const query = new GetDelayRequestQuery(flightId);
    return this.queryBus.execute(query);
  }
}
