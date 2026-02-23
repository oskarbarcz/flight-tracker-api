import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GenericBadRequestResponse } from '../../../core/http/response/bad-request.response';
import { UnauthorizedResponse } from '../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../core/http/response/forbidden.response';
import { GenericNotFoundResponse } from '../../../core/http/response/not-found.response';
import { Role } from '../../../core/http/auth/decorator/role.decorator';
import { v4 } from 'uuid';
import { UserRole } from 'prisma/client/client';
import {
  CreateAircraftRequest,
  GetAircraftResponse,
} from './request/aircraft.request';
import { UuidParam } from '../../../core/validation/uuid.param';
import { CreateAircraftCommand } from '../application/command/aircraft/create-aircraft.command';
import { GenericConflictResponse } from '../../../core/http/response/conflict.response';
import { GetAircraftByIdQuery } from '../application/query/aircraft/get-aircraft-by-id.query';
import { ListAllAircraftQuery } from '../application/query/aircraft/list-all-aircraft.query';

@ApiTags('operator fleet')
@Controller('/api/v1/operator/:operatorId/aircraft')
export class AircraftController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Register new aircraft for operator',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'operatorId',
    description: 'Operator unique identifier',
  })
  @ApiBody({ type: CreateAircraftRequest })
  @ApiCreatedResponse({
    description: 'Aircraft was created successfully',
    type: GetAircraftResponse,
  })
  @ApiBadRequestResponse({
    description: 'Request validation failed',
    type: GenericBadRequestResponse<GetAircraftResponse>,
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
    description: 'Resource was not found',
    type: GenericNotFoundResponse,
  })
  @ApiConflictResponse({
    description: 'New aircraft conflicts with existing aircraft',
    type: GenericConflictResponse,
  })
  @Post()
  @Role(UserRole.Operations)
  async create(
    @UuidParam('operatorId') operatorId: string,
    @Body() request: CreateAircraftRequest,
  ): Promise<GetAircraftResponse> {
    const aircraftId = v4();

    const command = new CreateAircraftCommand(aircraftId, operatorId, request);
    await this.commandBus.execute(command);

    const query = new GetAircraftByIdQuery(aircraftId, operatorId);
    return this.queryBus.execute(query);
  }

  @ApiOperation({ summary: 'Retrieve all aircraft for operator' })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({
    type: GetAircraftResponse,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description: 'Resource ID is not valid uuid v4',
    type: GenericBadRequestResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Get()
  async findAllForOperator(
    @UuidParam('operatorId') operatorId: string,
  ): Promise<GetAircraftResponse[]> {
    const query = new ListAllAircraftQuery(operatorId);
    return this.queryBus.execute(query);
  }

  @ApiOperation({ summary: 'Retrieve one aircraft' })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'operatorId',
    description: 'Operator unique identifier',
  })
  @ApiParam({
    name: 'aircraftId',
    description: 'Aircraft unique identifier',
  })
  @ApiOkResponse({ type: GetAircraftResponse })
  @ApiBadRequestResponse({
    description: 'Resource ID is not valid uuid v4',
    type: GenericBadRequestResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Get(':aircraftId')
  async findOne(
    @UuidParam('operatorId') operatorId: string,
    @UuidParam('aircraftId') aircraftId: string,
  ): Promise<GetAircraftResponse> {
    const query = new GetAircraftByIdQuery(operatorId, aircraftId);
    return this.queryBus.execute(query);
  }
  //
  // @ApiOperation({
  //   summary: 'Update aircraft',
  //   description:
  //     '**NOTE:** This endpoint is only available for users with `operations` role.',
  // })
  // @ApiBearerAuth('jwt')
  // @ApiParam({
  //   name: 'id',
  //   description: 'Aircraft unique identifier',
  // })
  // @ApiBody({ type: UpdateAircraftRequest })
  // @ApiOkResponse({
  //   description: 'Aircraft was updated successfully',
  //   type: Aircraft,
  // })
  // @ApiBadRequestResponse({
  //   description: 'Request validation failed',
  //   type: GenericBadRequestResponse<UpdateAircraftRequest>,
  // })
  // @ApiUnauthorizedResponse({
  //   description: 'User is not authorized (token is missing)',
  //   type: UnauthorizedResponse,
  // })
  // @ApiForbiddenResponse({
  //   description: 'User is not allowed to perform this action',
  //   type: ForbiddenResponse,
  // })
  // @ApiNotFoundResponse({
  //   description: 'Aircraft or operator with given it does not exist',
  //   type: GenericNotFoundResponse,
  // })
  // @Patch(':id')
  // @Role(UserRole.Operations)
  // async update(
  //   @UuidParam('id') id: string,
  //   @Body() updateAircraftDto: UpdateAircraftRequest,
  // ): Promise<UpdateAircraftResponse> {
  //   const command = new UpdateAircraftCommand(id, updateAircraftDto);
  //   await this.commandBus.execute(command);
  //
  //   const query = new GetAircraftByIdQuery(id);
  //   return this.queryBus.execute(query);
  // }
  //
  // @ApiOperation({
  //   summary: 'Remove aircraft',
  //   description:
  //     '**NOTE:** This endpoint is only available for users with `operations` role.',
  // })
  // @ApiBearerAuth('jwt')
  // @ApiParam({
  //   name: 'id',
  //   description: 'Aircraft unique identifier',
  // })
  // @ApiNoContentResponse({
  //   description: 'Aircraft was removed successfully',
  // })
  // @ApiBadRequestResponse({
  //   description: 'Aircraft id is not valid uuid v4',
  //   type: GenericBadRequestResponse,
  // })
  // @ApiUnauthorizedResponse({
  //   description: 'User is not authorized (token is missing)',
  //   type: UnauthorizedResponse,
  // })
  // @ApiForbiddenResponse({
  //   description: 'User is not allowed to perform this action',
  //   type: ForbiddenResponse,
  // })
  // @ApiNotFoundResponse({
  //   description: 'Aircraft with given it does not exist',
  //   type: GenericNotFoundResponse,
  // })
  // @Delete(':id')
  // @Role(UserRole.Operations)
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async remove(@UuidParam('id') id: string): Promise<void> {
  //   const command = new RemoveAircraftCommand(id);
  //   await this.commandBus.execute(command);
  // }
}
