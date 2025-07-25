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
import { AircraftService } from '../service/aircraft.service';
import {
  UpdateAircraftRequest,
  UpdateAircraftResponse,
} from '../dto/update-aircraft.dto';
import { Aircraft } from '../entity/aircraft.entity';
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
import { UserRole } from '@prisma/client';
import { UnauthorizedResponse } from '../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../core/http/response/forbidden.response';
import {
  CreateAircraftRequest,
  CreateAircraftResponse,
} from '../dto/create-aircraft.dto';

@ApiTags('aircraft')
@Controller('/api/v1/aircraft')
export class AircraftController {
  constructor(private readonly aircraftService: AircraftService) {}

  @ApiOperation({
    summary: 'Create new aircraft',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiBody({ type: CreateAircraftRequest })
  @ApiCreatedResponse({
    description: 'Aircraft was created successfully',
    type: CreateAircraftResponse,
  })
  @ApiBadRequestResponse({
    description: 'Request validation failed',
    type: GenericBadRequestResponse<CreateAircraftResponse>,
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
    @Body() createAircraftDto: CreateAircraftRequest,
  ): Promise<CreateAircraftResponse> {
    return await this.aircraftService.create(createAircraftDto);
  }

  @ApiOperation({ summary: 'Retrieve all aircraft' })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({
    description: 'Aircraft list',
    type: CreateAircraftResponse,
    isArray: true,
  })
  @Get()
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  async findAll(): Promise<CreateAircraftResponse[]> {
    return this.aircraftService.findAll();
  }

  @ApiOperation({ summary: 'Retrieve one aircraft' })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'id',
    description: 'Aircraft unique identifier',
  })
  @ApiOkResponse({
    description: 'Aircraft was created successfully',
    type: CreateAircraftResponse,
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
  async findOne(@UuidParam('id') id: string): Promise<CreateAircraftResponse> {
    return this.aircraftService.findOne(id);
  }

  @ApiOperation({
    summary: 'Update aircraft',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'id',
    description: 'Aircraft unique identifier',
  })
  @ApiBody({ type: UpdateAircraftRequest })
  @ApiOkResponse({
    description: 'Aircraft was updated successfully',
    type: Aircraft,
  })
  @ApiBadRequestResponse({
    description: 'Request validation failed',
    type: GenericBadRequestResponse<UpdateAircraftRequest>,
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
    @Body() updateAircraftDto: UpdateAircraftRequest,
  ): Promise<UpdateAircraftResponse> {
    return this.aircraftService.update(id, updateAircraftDto);
  }

  @ApiOperation({
    summary: 'Remove aircraft',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
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
    await this.aircraftService.remove(id);
  }
}
