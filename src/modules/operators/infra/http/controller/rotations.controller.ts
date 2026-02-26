import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
} from '@nestjs/common';
import { UserRole } from 'prisma/client/client';
import {
  CreateRotationRequest,
  GetRotationResponse,
  UpdateRotationRequest,
} from '../request/rotation.request';
import { GenericBadRequestResponse } from '../../../../../core/http/response/bad-request.response';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../core/http/response/forbidden.response';
import { GenericNotFoundResponse } from '../../../../../core/http/response/not-found.response';
import { Role } from '../../../../../core/http/auth/decorator/role.decorator';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { v4 } from 'uuid';
import { CreateRotationCommand } from '../../../application/command/rotation/create-rotation.command';
import { UuidParam } from '../../../../../core/validation/uuid.param';
import { GetRotationByIdQuery } from '../../../application/query/rotation/get-rotation-by-id.query';
import { ListAllRotationsQuery } from '../../../application/query/rotation/list-all-rotations.query';
import { RemoveRotationCommand } from '../../../application/command/rotation/remove-rotation.command';
import { UpdateRotationCommand } from '../../../application/command/rotation/update-rotation.command';

@ApiTags('operator rotations')
@Controller('/api/v1/operator/:operatorId/rotation')
export class RotationsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Create rotation for operator',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'operatorId', description: 'Operator unique identifier' })
  @ApiBody({ type: CreateRotationRequest })
  @ApiOkResponse({ type: GetRotationResponse })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Post()
  @Role(UserRole.Operations)
  async create(
    @UuidParam('operatorId') operatorId: string,
    @Body() request: CreateRotationRequest,
  ): Promise<GetRotationResponse> {
    const rotationId = v4();

    const command = new CreateRotationCommand(operatorId, rotationId, request);
    await this.commandBus.execute(command);

    const query = new GetRotationByIdQuery(operatorId, rotationId);
    return this.queryBus.execute(query);
  }

  @ApiOperation({ summary: 'Retrieve all rotations' })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({ type: GetRotationResponse, isArray: true })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @Get()
  findAllForOperator(
    @UuidParam('operatorId') operatorId: string,
  ): Promise<GetRotationResponse[]> {
    const query = new ListAllRotationsQuery(operatorId);
    return this.queryBus.execute(query);
  }

  @ApiOperation({ summary: 'Retrieve one rotation' })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'operatorId', description: 'Operator unique identifier' })
  @ApiParam({ name: 'rotationId', description: 'Rotation unique identifier' })
  @ApiOkResponse({ type: GetRotationResponse })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Get(':rotationId')
  async findOne(
    @UuidParam('rotationId') rotationId: string,
    @UuidParam('operatorId') operatorId: string,
  ): Promise<GetRotationResponse> {
    const query = new GetRotationByIdQuery(operatorId, rotationId);
    return this.queryBus.execute(query);
  }

  @ApiOperation({
    summary: 'Update a rotation',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'operatorId', description: 'Operator unique identifier' })
  @ApiParam({ name: 'rotationId', description: 'Rotation unique identifier' })
  @ApiBody({ type: UpdateRotationRequest })
  @ApiOkResponse({ type: GetRotationResponse })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Patch(':rotationId')
  @Role(UserRole.Operations)
  async update(
    @UuidParam('rotationId') rotationId: string,
    @UuidParam('operatorId') operatorId: string,
    @Body() request: UpdateRotationRequest,
  ): Promise<GetRotationResponse> {
    const command = new UpdateRotationCommand(operatorId, rotationId, request);
    await this.commandBus.execute(command);

    const query = new GetRotationByIdQuery(operatorId, rotationId);
    return this.queryBus.execute(query);
  }

  @ApiOperation({
    summary: 'Remove a rotation',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'operatorId', description: 'Operator unique identifier' })
  @ApiParam({ name: 'rotationId', description: 'Rotation unique identifier' })
  @ApiNoContentResponse({
    description: 'Rotation was removed successfully',
  })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Delete(':rotationId')
  @Role(UserRole.Operations)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @UuidParam('rotationId') rotationId: string,
    @UuidParam('operatorId') operatorId: string,
  ): Promise<void> {
    const command = new RemoveRotationCommand(operatorId, rotationId);
    await this.commandBus.execute(command);
  }
}
