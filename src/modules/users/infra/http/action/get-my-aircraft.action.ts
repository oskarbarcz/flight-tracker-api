import { Controller, Get, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { UserAircraftEntry } from '../../../model/user-aircraft.model';
import { ListUserAircraftQuery } from '../../../application/query/list-user-aircraft.query';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { AuthorizedRequest } from '../../../../../core/http/request/authorized.request';

@ApiTags('user')
@Controller('/api/v1/user')
export class GetMyAircraftAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: 'List aircraft the current user has flown',
  })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({
    type: UserAircraftEntry,
    isArray: true,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @Get('/me/aircraft')
  run(@Req() request: AuthorizedRequest): Promise<UserAircraftEntry[]> {
    const query = new ListUserAircraftQuery(request.user.sub);
    return this.queryBus.execute(query);
  }
}
