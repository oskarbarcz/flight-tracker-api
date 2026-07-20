import { Controller, Get, Query, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { GetUserDto, ListUsersFilters } from '../request/get-user.dto';
import { ListUsersQuery } from '../../../application/query/list-users.query';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../core/http/response/forbidden.response';
import { Role } from '../../../../../core/http/auth/decorator/role.decorator';
import { AuthorizedRequest } from '../../../../../core/http/request/authorized.request';
import { UserRole } from '../../../model/user-role';
import { ListUsersForbiddenError } from '../../../model/error/user.error';

@ApiTags('user')
@Controller('/api/v1/user')
export class ListUsersAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: 'Retrieve all users',
    description:
      '**NOTE:** This endpoint is only available for users with `admin` role,' +
      ' but users with `operations` role can retrieve users by pilot license' +
      ' ID.',
  })
  @ApiParam({
    name: 'pilotLicenseId',
    required: false,
    description: 'Pilot license ID',
    type: 'string',
  })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({
    description: 'Users list',
    type: GetUserDto,
    isArray: true,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @ApiForbiddenResponse({
    description: 'User is not allowed to perform this action',
    type: ForbiddenResponse,
  })
  @Get()
  @Role(UserRole.Admin, UserRole.Operations)
  run(
    @Query() filters: ListUsersFilters,
    @Req() req: AuthorizedRequest,
  ): Promise<GetUserDto[]> {
    if (
      req.user.role === UserRole.Operations.toLowerCase() &&
      !filters.pilotLicenseId
    ) {
      // operations can only retrieve users by pilot license ID
      throw new ListUsersForbiddenError();
    }

    const query = new ListUsersQuery(filters);
    return this.queryBus.execute(query);
  }
}
