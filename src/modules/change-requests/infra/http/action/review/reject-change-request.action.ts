import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
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
import { GenericBadRequestResponse } from '../../../../../../core/http/response/bad-request.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { RejectChangeRequestRequest } from '../../request/change-request.dto';
import { ChangeRequestWithFields } from '../../../../model/change-request.model';
import { RejectChangeRequestCommand } from '../../../../application/command/reject-change-request.command';
import { GetChangeRequestByIdQuery } from '../../../../application/query/get-change-request-by-id.query';

@ApiTags('user data change request')
@Controller('api/v1/user-data-change-request/:id/reject')
export class RejectChangeRequestAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Reject a user data change request',
    description:
      'Turns the change down with a reason; the targeted record is left as it is. ' +
      '**NOTE:** This endpoint is only available for users with `operations` or `admin` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'id',
    description: 'User data change request unique identifier',
  })
  @ApiBody({ type: RejectChangeRequestRequest })
  @ApiOkResponse({ type: ChangeRequestWithFields })
  @ApiBadRequestResponse({
    type: GenericBadRequestResponse<RejectChangeRequestRequest>,
  })
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
    @Body() body: RejectChangeRequestRequest,
  ): Promise<ChangeRequestWithFields> {
    const command = new RejectChangeRequestCommand(
      id,
      request.user.sub,
      body.rejectionReason,
    );
    await this.commandBus.execute(command);

    const query = new GetChangeRequestByIdQuery(id);
    return this.queryBus.execute(query);
  }
}
