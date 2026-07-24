import { Controller, Get, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { Rotation } from '../../../model/rotation.model';
import { ListRotationsForUserQuery } from '../../../application/query/list-rotations-for-user.query';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { AuthorizedRequest } from '../../../../../core/http/request/authorized.request';

@ApiTags('rotation')
@Controller('/api/v1/user')
export class ListAssignedRotationsAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'List rotations assigned to the current user' })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({ type: Rotation, isArray: true })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @Get('/me/rotations')
  list(@Req() request: AuthorizedRequest): Promise<Rotation[]> {
    const query = new ListRotationsForUserQuery(request.user.sub);
    return this.queryBus.execute(query);
  }
}
