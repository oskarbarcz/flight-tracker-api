import { Controller, Get, Query, Req } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { UserRole } from '../../../../../users/model/user-role';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';
import { AuthorizedRequest } from '../../../../../../core/http/request/authorized.request';
import { GenericBadRequestResponse } from '../../../../../../core/http/response/bad-request.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { MyChangeRequestListFilters } from '../../request/change-request.dto';
import { ChangeRequest } from '../../../../model/change-request.model';
import { ListMyChangeRequestsQuery } from '../../../../application/query/list-my-change-requests.query';

@ApiTags('user data change request')
@Controller('api/v1/user/me/data-change-request')
export class ListMyChangeRequestsAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: 'List the user data change requests I proposed',
    description:
      'Lists only the caller’s own user data change requests, newest first. ' +
      '**NOTE:** This endpoint is only available for users with `cabin crew` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({ type: ChangeRequest, isArray: true })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @Get()
  @Role(UserRole.CabinCrew)
  async run(
    @Req() request: AuthorizedRequest,
    @Query() filters: MyChangeRequestListFilters,
  ): Promise<ChangeRequest[]> {
    const query = new ListMyChangeRequestsQuery(
      request.user.sub,
      filters.status,
    );
    return this.queryBus.execute(query);
  }
}
