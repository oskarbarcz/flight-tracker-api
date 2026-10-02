import { Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UserRole } from '../../../../../users/model/user-role';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { AuthorizedRequest } from '../../../../../../core/http/request/authorized.request';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { ChangeRequestWithFields } from '../../../../model/change-request.model';
import { AcceptChangeRequestCommand } from '../../../../application/command/accept-change-request.command';
import { GetChangeRequestByIdQuery } from '../../../../application/query/get-change-request-by-id.query';

@ApiTags('user data change request')
@Controller('api/v1/user-data-change-request/:id/accept')
export class AcceptChangeRequestAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Accept a user data change request',
    description:
      'Applies every proposed value to the targeted record at once, overwriting whatever it holds now. ' +
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
  @ApiConflictResponse({
    description:
      'The user data change request has already been decided or withdrawn.',
  })
  @Post()
  @HttpCode(HttpStatus.OK)
  @Role(UserRole.Operations, UserRole.Admin)
  async run(
    @UuidParam('id') id: string,
    @Req() request: AuthorizedRequest,
  ): Promise<ChangeRequestWithFields> {
    const command = new AcceptChangeRequestCommand(id, request.user.sub);
    await this.commandBus.execute(command);

    const query = new GetChangeRequestByIdQuery(id);
    return this.queryBus.execute(query);
  }
}
