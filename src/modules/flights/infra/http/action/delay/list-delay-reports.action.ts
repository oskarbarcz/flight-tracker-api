import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { UserRole } from 'prisma/client/client';
import {
  DelayRequestListFilters,
  GetDelayRequestResponse,
} from '../../request/delay.dto';
import { DelayRequestStatus } from '../../../../model/delay-request.model';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';
import { ListDelayRequestsQuery } from '../../../../application/query/delay/list-delay-requests.query';

@ApiTags('flight delay')
@Controller('api/v1/flight/delay')
export class ListDelayReportsAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: 'List delay requests',
    description:
      'Lists delay requests, optionally filtered with `?status=pending` (awaiting Operations) or `?status=settled` (fully allocated and accepted). ' +
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiQuery({
    name: 'status',
    description: 'Filter by derived request status',
    enum: DelayRequestStatus,
    required: false,
  })
  @ApiOkResponse({ type: GetDelayRequestResponse, isArray: true })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @Get()
  @Role(UserRole.Operations)
  public async run(
    @Query() filters: DelayRequestListFilters,
  ): Promise<GetDelayRequestResponse[]> {
    return this.queryBus.execute(new ListDelayRequestsQuery(filters.status));
  }
}
