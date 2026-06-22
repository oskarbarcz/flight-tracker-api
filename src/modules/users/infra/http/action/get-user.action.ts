import { Controller, Get } from '@nestjs/common';
import {
  ApiBadRequestResponse,
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
import { GetUserDto } from '../request/get-user.dto';
import { GetUserByIdQuery } from '../../../application/query/get-user-by-id.query';
import { UuidParam } from '../../../../../core/validation/uuid.param';
import { GenericBadRequestResponse } from '../../../../../core/http/response/bad-request.response';
import { GenericNotFoundResponse } from '../../../../../core/http/response/not-found.response';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../core/http/response/forbidden.response';
import { Role } from '../../../../../core/http/auth/decorator/role.decorator';
import { UserRole } from '../../../../../../prisma/client/enums';

@ApiTags('user')
@Controller('/api/v1/user')
export class GetUserAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: 'Retrieve one user',
    description:
      '**NOTE:** This endpoint is only available for users with `admin` or' +
      '`cabincrew` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'id',
    description: 'User unique identifier',
  })
  @ApiOkResponse({
    description: 'User was created successfully',
    type: GetUserDto,
  })
  @ApiBadRequestResponse({
    description: 'User id is not valid uuid v4',
    type: GenericBadRequestResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @ApiForbiddenResponse({
    description: 'User is not allowed to perform this action',
    type: ForbiddenResponse,
  })
  @ApiNotFoundResponse({
    description: 'User with given it does not exist',
    type: GenericNotFoundResponse,
  })
  @Get(':id')
  @Role(UserRole.Admin, UserRole.Operations)
  run(@UuidParam('id') id: string): Promise<GetUserDto> {
    const query = new GetUserByIdQuery(id);
    return this.queryBus.execute(query);
  }
}
