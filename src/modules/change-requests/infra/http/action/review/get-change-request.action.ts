import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { UserRole } from '../../../../../users/model/user-role';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { ChangeRequestWithFields } from '../../../../model/change-request.model';
import { GetChangeRequestByIdQuery } from '../../../../application/query/get-change-request-by-id.query';

@ApiTags('user data change request')
@Controller('api/v1/user-data-change-request')
export class GetChangeRequestAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: 'Retrieve one user data change request',
    description:
      'Answers the user data change request with the value each touched field holds now beside the proposed one. ' +
      '**NOTE:** This endpoint is only available for users with `operations` or `admin` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'id',
    description: 'User data change request unique identifier',
  })
  @ApiOkResponse({ type: ChangeRequestWithFields })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Get(':id')
  @Role(UserRole.Operations, UserRole.Admin)
  async run(@UuidParam('id') id: string): Promise<ChangeRequestWithFields> {
    const query = new GetChangeRequestByIdQuery(id);
    return this.queryBus.execute(query);
  }
}
