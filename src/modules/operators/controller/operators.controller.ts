import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreateOperatorDto } from '../dto/create-operator.dto';
import { UpdateOperatorDto } from '../dto/update-operator.dto';
import { UuidParam } from '../../../core/validation/uuid.param';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  PartialType,
} from '@nestjs/swagger';
import { Operator } from '../entity/operator.entity';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { GenericBadRequestResponse } from '../../../core/http/response/bad-request.response';
import { GenericNotFoundResponse } from '../../../core/http/response/not-found.response';
import { UnauthorizedResponse } from '../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../core/http/response/forbidden.response';
import { Role } from '../../../core/http/auth/decorator/role.decorator';
import { UserRole } from 'prisma/client/client';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateOperatorCommand } from '../application/command/create-operator.command';
import { UpdateOperatorCommand } from '../application/command/update-operator.command';
import { RemoveOperatorCommand } from '../application/command/remove-operator.command';
import { GetOperatorByIdQuery } from '../application/query/get-operator-by-id.query';
import { ListAllOperatorsQuery } from '../application/query/list-all-operators.query';
import { v4 } from 'uuid';

@ApiTags('operator')
@Controller('/api/v1/operator')
export class OperatorsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Create new operator',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiBody({ type: CreateOperatorDto })
  @ApiCreatedResponse({
    description: 'Operator was created successfully',
    type: Operator,
  })
  @ApiBadRequestResponse({
    description: 'Request validation failed',
    type: GenericBadRequestResponse<CreateOperatorDto>,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @ApiForbiddenResponse({
    description: 'User is not allowed to perform this action',
    type: ForbiddenResponse,
  })
  @Post()
  @Role(UserRole.Operations)
  async create(
    @Body() createOperatorDto: CreateOperatorDto,
  ): Promise<Operator> {
    const operatorId = v4();

    const command = new CreateOperatorCommand(operatorId, createOperatorDto);
    await this.commandBus.execute(command);

    const query = new GetOperatorByIdQuery(operatorId);
    return this.queryBus.execute(query);
  }

  @ApiOperation({ summary: 'Retrieve all operators' })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({
    description: 'Operators list',
    type: Operator,
    isArray: true,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @Get()
  findAll(): Promise<Operator[]> {
    const query = new ListAllOperatorsQuery();
    return this.queryBus.execute(query);
  }

  @ApiOperation({ summary: 'Retrieve one operator' })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'id',
    description: 'Operator unique identifier',
  })
  @ApiOkResponse({
    description: 'Operator was created successfully',
    type: PartialType(Operator),
  })
  @ApiBadRequestResponse({
    description: 'Operator id is not valid uuid v4',
    type: GenericBadRequestResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @ApiNotFoundResponse({
    description: 'Operator with given it does not exist',
    type: GenericNotFoundResponse,
  })
  @Get(':id')
  findOne(@UuidParam('id') id: string): Promise<Operator> {
    const query = new GetOperatorByIdQuery(id);
    return this.queryBus.execute(query);
  }

  @ApiOperation({
    summary: 'Update operator',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'id',
    description: 'Operator unique identifier',
  })
  @ApiBody({ type: UpdateOperatorDto })
  @ApiOkResponse({
    description: 'Operator was updated successfully',
    type: Operator,
  })
  @ApiBadRequestResponse({
    description: 'Request validation failed',
    type: GenericBadRequestResponse<CreateOperatorDto>,
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
    description: 'Operator with given it does not exist',
    type: GenericNotFoundResponse,
  })
  @Patch(':id')
  @Role(UserRole.Operations)
  async update(
    @UuidParam('id') id: string,
    @Body() updateOperatorDto: UpdateOperatorDto,
  ): Promise<Operator> {
    const command = new UpdateOperatorCommand(id, updateOperatorDto);
    await this.commandBus.execute(command);

    const query = new GetOperatorByIdQuery(id);
    return this.queryBus.execute(query);
  }

  @ApiOperation({
    summary: 'Remove operator',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'id',
    description: 'Operator unique identifier',
  })
  @ApiNoContentResponse({
    description: 'Operator was removed successfully',
  })
  @ApiBadRequestResponse({
    description:
      'Operator id is not valid uuid v4, has flights assigned or has aircraft assigned',
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
    description: 'Operator with given it does not exist',
    type: GenericNotFoundResponse,
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Role(UserRole.Operations)
  async remove(@UuidParam('id') id: string): Promise<void> {
    const command = new RemoveOperatorCommand(id);
    await this.commandBus.execute(command);
  }
}
