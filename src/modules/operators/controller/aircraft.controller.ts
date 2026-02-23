import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GenericBadRequestResponse } from '../../../core/http/response/bad-request.response';
import { UnauthorizedResponse } from '../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../core/http/response/forbidden.response';
import { GenericNotFoundResponse } from '../../../core/http/response/not-found.response';
import { Role } from '../../../core/http/auth/decorator/role.decorator';
import { v4 } from 'uuid';
import { UserRole } from 'prisma/client/client';
import { LegacyCreateAircraftCommand } from '../../aircraft/application/command/legacy-create-aircraft.command';
import { GetAircraftByIdQuery } from '../../aircraft/application/query/get-aircraft-by-id.query';
import {
  LegacyCreateAircraftRequest,
  LegacyCreateAircraftResponse,
} from './request/aircraft.request';

@ApiTags('operator fleet')
@Controller('/api/v1/operator/:operatorId/aircraft')
export class AircraftController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Create new aircraft',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
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

  // @ApiOperation({ summary: 'Retrieve all aircraft' })
  // @ApiBearerAuth('jwt')
  // @ApiOkResponse({
  //   description: 'Aircraft list',
  //   type: CreateAircraftResponse,
  //   isArray: true,
  // })
  // @Get()
  // @ApiUnauthorizedResponse({
  //   description: 'User is not authorized (token is missing)',
  //   type: UnauthorizedResponse,
  // })
  // async findAll(): Promise<CreateAircraftResponse[]> {
  //   const query = new ListAllAircraftQuery();
  //   return this.queryBus.execute(query);
  // }
  //
  // @ApiOperation({ summary: 'Retrieve one aircraft' })
  // @ApiBearerAuth('jwt')
  // @ApiParam({
  //   name: 'id',
  //   description: 'Aircraft unique identifier',
  // })
  // @ApiOkResponse({
  //   description: 'Aircraft was created successfully',
  //   type: CreateAircraftResponse,
  // })
  // @ApiBadRequestResponse({
  //   description: 'Aircraft id is not valid uuid v4',
  //   type: GenericBadRequestResponse,
  // })
  // @ApiUnauthorizedResponse({
  //   description: 'User is not authorized (token is missing)',
  //   type: UnauthorizedResponse,
  // })
  // @ApiNotFoundResponse({
  //   description: 'Aircraft with given it does not exist',
  //   type: GenericNotFoundResponse,
  // })
  // @Get(':id')
  // async findOne(@UuidParam('id') id: string): Promise<CreateAircraftResponse> {
  //   const query = new GetAircraftByIdQuery(id);
  //   return this.queryBus.execute(query);
  // }
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
