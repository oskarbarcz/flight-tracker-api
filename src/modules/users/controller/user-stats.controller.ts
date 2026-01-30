import { Controller, Get, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserStatsDto } from '../dto/get-user.dto';
import { UnauthorizedResponse } from '../../../core/http/response/unauthorized.response';
import { AuthorizedRequest } from '../../../core/http/request/authorized.request';
import { QueryBus } from '@nestjs/cqrs';
import { GetUserStatsQuery } from '../application/query/get-user-stats.query';

@ApiTags('user')
@Controller('/api/v1/user')
export class UserStatsController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: 'Get user stats',
  })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({
    description: 'User stats',
    type: UserStatsDto,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @Get('/me/stats')
  getMyStats(@Req() request: AuthorizedRequest): Promise<UserStatsDto> {
    const query = new GetUserStatsQuery(request.user.sub);
    return this.queryBus.execute(query);
  }
}
