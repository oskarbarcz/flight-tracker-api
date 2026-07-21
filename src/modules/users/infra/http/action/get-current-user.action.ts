import { Controller, Get, Req, UseInterceptors } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { GetUserDto } from '../request/get-user.dto';
import { GetUserByIdQuery } from '../../../application/query/get-user-by-id.query';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { AuthorizedRequest } from '../../../../../core/http/request/authorized.request';
import { UserAwareCacheInterceptor } from '../../../../../core/cache/user-aware-cache.interceptor';
import { CACHE_KEYS, CACHE_TTL_MS } from '../../../../../core/cache/cache.key';

@ApiTags('user')
@Controller('/api/v1/user')
@UseInterceptors(UserAwareCacheInterceptor)
export class GetCurrentUserAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: 'Retrieve details of the current user',
  })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({
    type: GetUserDto,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @CacheKey(CACHE_KEYS.USER_ME)
  @CacheTTL(CACHE_TTL_MS.USER_ME)
  @Get('/me')
  run(@Req() request: AuthorizedRequest): Promise<GetUserDto> {
    const query = new GetUserByIdQuery(request.user.sub);
    return this.queryBus.execute(query);
  }
}
