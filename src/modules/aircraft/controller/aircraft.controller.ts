import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { Aircraft } from '../../operators/model/aircraft.model';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { GenericBadRequestResponse } from '../../../core/http/response/bad-request.response';
import { UuidParam } from '../../../core/validation/uuid.param';
import { GenericNotFoundResponse } from '../../../core/http/response/not-found.response';
import { Role } from '../../../core/http/auth/decorator/role.decorator';
import { UserRole } from 'prisma/client/client';
import { UnauthorizedResponse } from '../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../core/http/response/forbidden.response';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { LegacyCreateAircraftCommand } from '../application/command/legacy-create-aircraft.command';
import { LegacyUpdateAircraftCommand } from '../application/command/legacy-update-aircraft.command';
import { LegacyRemoveAircraftCommand } from '../application/command/legacy-remove-aircraft.command';
import { GetAircraftByIdQuery } from '../application/query/get-aircraft-by-id.query';
import { ListAllAircraftQuery } from '../application/query/list-all-aircraft.query';
import { v4 } from 'uuid';
import {
  LegacyCreateAircraftRequest,
  LegacyCreateAircraftResponse,
  LegacyUpdateAircraftRequest,
  LegacyUpdateAircraftResponse,
} from '../../operators/controller/request/aircraft.request';

@ApiTags('aircraft')
@Controller('/api/v1/aircraft')
export class LegacyAircraftController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Create new aircraft',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
    deprecated: true,
  })
  @ApiBearerAuth('jwt')
  @ApiBody({ type: LegacyCreateAircraftRequest })
  @ApiCreatedResponse({
    description: 'Aircraft was created successfully',
    type: LegacyCreateAircraftResponse,
  })
  @ApiBadRequestResponse({
    description: 'Request validation failed',
    type: GenericBadRequestResponse<LegacyCreateAircraftResponse>,
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
  @Post()
  @Role(UserRole.Operations)
  async create(
    @Body() createAircraftDto: LegacyCreateAircraftRequest,
  ): Promise<LegacyCreateAircraftResponse> {
    const aircraftId = v4();

    const command = new LegacyCreateAircraftCommand(
      aircraftId,
      createAircraftDto,
    );
    await this.commandBus.execute(command);

    const query = new GetAircraftByIdQuery(aircraftId);
    return this.queryBus.execute(query);
  }

  @ApiOperation({ summary: 'Retrieve all aircraft', deprecated: true })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({
    description: 'Aircraft list',
    type: LegacyCreateAircraftResponse,
    isArray: true,
  })
  @Get()
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  async findAll(): Promise<LegacyCreateAircraftResponse[]> {
    const query = new ListAllAircraftQuery();
    return this.queryBus.execute(query);
  }

  @ApiOperation({ summary: 'Retrieve one aircraft', deprecated: true })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'id',
    description: 'Aircraft unique identifier',
  })
  @ApiOkResponse({
    description: 'Aircraft was created successfully',
    type: LegacyCreateAircraftResponse,
  })
  @ApiBadRequestResponse({
    description: 'Aircraft id is not valid uuid v4',
    type: GenericBadRequestResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @ApiNotFoundResponse({
    description: 'Aircraft with given it does not exist',
    type: GenericNotFoundResponse,
  })
  @Get(':id')
  async findOne(
    @UuidParam('id') id: string,
  ): Promise<LegacyCreateAircraftResponse> {
    const query = new GetAircraftByIdQuery(id);
    return this.queryBus.execute(query);
  }

  @ApiOperation({
    summary: 'Update aircraft',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
    deprecated: true,
  })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'id',
    description: 'Aircraft unique identifier',
  })
  @ApiBody({ type: LegacyUpdateAircraftRequest })
  @ApiOkResponse({
    description: 'Aircraft was updated successfully',
    type: Aircraft,
  })
  @ApiBadRequestResponse({
    description: 'Request validation failed',
    type: GenericBadRequestResponse<LegacyUpdateAircraftRequest>,
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
    description: 'Aircraft or operator with given it does not exist',
    type: GenericNotFoundResponse,
  })
  @Patch(':id')
  @Role(UserRole.Operations)
  async update(
    @UuidParam('id') id: string,
    @Body() updateAircraftDto: LegacyUpdateAircraftRequest,
  ): Promise<LegacyUpdateAircraftResponse> {
    const command = new LegacyUpdateAircraftCommand(id, updateAircraftDto);
    await this.commandBus.execute(command);

    const query = new GetAircraftByIdQuery(id);
    return this.queryBus.execute(query);
  }

  @ApiOperation({
    summary: 'Remove aircraft',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
    deprecated: true,
  })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'id',
    description: 'Aircraft unique identifier',
  })
  @ApiNoContentResponse({
    description: 'Aircraft was removed successfully',
  })
  @ApiBadRequestResponse({
    description: 'Aircraft id is not valid uuid v4',
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
    description: 'Aircraft with given it does not exist',
    type: GenericNotFoundResponse,
  })
  @Delete(':id')
  @Role(UserRole.Operations)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@UuidParam('id') id: string): Promise<void> {
    const command = new LegacyRemoveAircraftCommand(id);
    await this.commandBus.execute(command);
  }
}
