import { Body, Controller, Post, Req } from '@nestjs/common';
import { AuthorizedRequest } from '../../../../../core/http/request/authorized.request';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { v4 } from 'uuid';
import { UuidParam } from '../../../../../core/validation/uuid.param';
import { Role } from '../../../../../core/http/auth/decorator/role.decorator';
import { UserRole } from '../../../../users/model/user-role';
import { GenericBadRequestResponse } from '../../../../../core/http/response/bad-request.response';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../core/http/response/forbidden.response';
import { Rotation } from '../../../model/rotation.model';
import { CreateRotationRequest } from '../request/rotation.request';
import { CreateRotationCommand } from '../../../application/command/create-rotation.command';
import { GetRotationByIdQuery } from '../../../application/query/get-rotation-by-id.query';

@ApiTags('rotation')
@Controller('/api/v1/operator')
export class CreateRotationAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ summary: 'Create a new rotation for an operator' })
  @ApiBearerAuth('jwt')
  @ApiBody({ type: CreateRotationRequest })
  @ApiCreatedResponse({ type: Rotation })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @Post(':operatorId/rotation')
  @Role(UserRole.Operations)
  async create(
    @UuidParam('operatorId') operatorId: string,
    @Body() body: CreateRotationRequest,
    @Req() request: AuthorizedRequest,
  ): Promise<Rotation> {
    const rotationId = v4();

    const command = new CreateRotationCommand(
      rotationId,
      body.name,
      operatorId,
      body.pilotId,
      request.user.sub,
    );
    await this.commandBus.execute(command);

    const query = new GetRotationByIdQuery(rotationId);
    return this.queryBus.execute(query);
  }
}
