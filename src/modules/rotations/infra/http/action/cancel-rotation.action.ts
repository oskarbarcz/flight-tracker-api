import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { AuthorizedRequest } from '../../../../../core/http/request/authorized.request';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UuidParam } from '../../../../../core/validation/uuid.param';
import { Role } from '../../../../../core/http/auth/decorator/role.decorator';
import { UserRole } from '../../../../users/model/user-role';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../core/http/response/forbidden.response';
import { GenericNotFoundResponse } from '../../../../../core/http/response/not-found.response';
import { GenericConflictResponse } from '../../../../../core/http/response/conflict.response';
import { GenericBadRequestResponse } from '../../../../../core/http/response/bad-request.response';
import { Rotation } from '../../../model/rotation.model';
import { CancelRotationRequest } from '../request/rotation.request';
import { CancelRotationCommand } from '../../../application/command/cancel-rotation.command';
import { GetRotationByIdQuery } from '../../../application/query/get-rotation-by-id.query';

@ApiTags('rotation')
@Controller('/api/v1/rotation')
export class CancelRotationAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ summary: 'Cancel a ready rotation' })
  @ApiBearerAuth('jwt')
  @ApiBody({ type: CancelRotationRequest, required: false })
  @ApiOkResponse({ type: Rotation })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @ApiConflictResponse({ type: GenericConflictResponse })
  @Post(':rotationId/cancel')
  @HttpCode(HttpStatus.OK)
  @Role(UserRole.Operations)
  async cancel(
    @UuidParam('rotationId') rotationId: string,
    @Body() body: CancelRotationRequest,
    @Req() request: AuthorizedRequest,
  ): Promise<Rotation> {
    const command = new CancelRotationCommand(
      rotationId,
      request.user.sub,
      body.reason ?? null,
    );
    await this.commandBus.execute(command);

    const query = new GetRotationByIdQuery(rotationId);
    return this.queryBus.execute(query);
  }
}
