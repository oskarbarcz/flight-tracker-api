import { Controller, Get, Query } from '@nestjs/common';
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
import { GenericBadRequestResponse } from '../../../../../../core/http/response/bad-request.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { ChangeRequestListFilters } from '../../request/change-request.dto';
import { ChangeRequest } from '../../../../model/change-request.model';
import { ListChangeRequestsQuery } from '../../../../application/query/list-change-requests.query';

@ApiTags('user data change request')
@Controller('api/v1/user-data-change-request')
export class ListChangeRequestsAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: 'List the user data change request review queue',
    description:
      'Lists user data change requests of every kind of data, oldest first. ' +
      '**NOTE:** This endpoint is only available for users with `operations` or `admin` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({ type: ChangeRequest, isArray: true })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @Get()
  @Role(UserRole.Operations, UserRole.Admin)
  async run(
    @Query() filters: ChangeRequestListFilters,
  ): Promise<ChangeRequest[]> {
    const query = new ListChangeRequestsQuery({
      status: filters.status,
      resource: filters.resource,
    });
    return this.queryBus.execute(query);
  }
}
