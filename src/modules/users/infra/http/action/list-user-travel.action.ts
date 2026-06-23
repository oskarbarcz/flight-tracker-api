import { Controller, Get, Req } from '@nestjs/common';
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
import { UserTravel } from '../../../model/user-travel.model';
import { ListUserTravelQuery } from '../../../application/query/list-user-travel.query';
import { UuidParam } from '../../../../../core/validation/uuid.param';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../core/http/response/forbidden.response';
import { UserRole } from '../../../../../../prisma/client/enums';
import { AuthorizedRequest } from '../../../../../core/http/request/authorized.request';
import { CannotAccessOtherUsersTravelError } from '../../../model/error/user-travel.error';

@ApiTags('user')
@Controller('/api/v1/user')
export class ListUserTravelAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: 'List travel history of a user',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'id',
    description: 'User unique identifier',
  })
  @ApiOkResponse({
    type: UserTravel,
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
  @Get(':id/travel')
  run(
    @UuidParam('id') id: string,
    @Req() request: AuthorizedRequest,
  ): Promise<UserTravel[]> {
    const isCabinCrew = request.user.role === UserRole.CabinCrew.toLowerCase();
    if (isCabinCrew && request.user.sub !== id) {
      throw new CannotAccessOtherUsersTravelError();
    }

    const query = new ListUserTravelQuery(id);
    return this.queryBus.execute(query);
  }
}
