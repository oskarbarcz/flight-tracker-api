import { Controller, Get, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { GetUserDto } from '../request/get-user.dto';
import { GetUserByIdQuery } from '../../../application/query/get-user-by-id.query';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { AuthorizedRequest } from '../../../../../core/http/request/authorized.request';

@ApiTags('user')
@Controller('/api/v1/user')
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
  @Get('/me')
  run(@Req() request: AuthorizedRequest): Promise<GetUserDto> {
    const query = new GetUserByIdQuery(request.user.sub);
    return this.queryBus.execute(query);
  }
}
