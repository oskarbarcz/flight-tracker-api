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
import { AircraftService } from './aircraft.service';
import { CreateAircraftDto } from './dto/create-aircraft.dto';
import { UpdateAircraftDto } from './dto/update-aircraft.dto';
import { Aircraft } from './entities/aircraft.entity';
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
import { GenericBadRequestResponse } from '../common/response/bad-request.response';
import { uuid } from '../common/validation/uuid.param';
import { GenericNotFoundResponse } from '../common/response/not-found.response';
import { Role } from '../auth/decorator/role.decorator';
import { UserRole } from '@prisma/client';
import { UnauthorizedResponse } from '../common/response/unauthorized.response';
import { ForbiddenRequest } from '../common/response/forbidden.response';

@ApiTags('aircraft')
@Controller('/api/v1/aircraft')
export class AircraftController {
  constructor(private readonly aircraftService: AircraftService) {}

  @ApiOperation({
    summary: 'Create new aircraft',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth()
  @ApiBody({ type: CreateAircraftDto })
  @ApiCreatedResponse({
    description: 'Aircraft was created successfully',
    type: Aircraft,
  })
  @ApiBadRequestResponse({
    description: 'Request validation failed',
    type: GenericBadRequestResponse<CreateAircraftDto>,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @ApiForbiddenResponse({
    description: 'User is not allowed to perform this action',
    type: ForbiddenRequest,
  })
  @Post()
  @Role(UserRole.Operations)
  async create(
    @Body() createAircraftDto: CreateAircraftDto,
  ): Promise<Aircraft> {
    return await this.aircraftService.create(createAircraftDto);
  }

  @ApiOperation({ summary: 'Retrieve all aircraft' })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Aircraft list',
    type: Aircraft,
    isArray: true,
  })
  @Get()
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  async findAll(): Promise<Aircraft[]> {
    return this.aircraftService.findAll();
  }

  @ApiOperation({ summary: 'Retrieve one aircraft' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'Aircraft unique identifier',
  })
  @ApiOkResponse({
    description: 'Aircraft was created successfully',
    type: Aircraft,
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
  async findOne(@uuid('id') id: string): Promise<Aircraft> {
    return this.aircraftService.findOne(id);
  }

  @ApiOperation({
    summary: 'Update aircraft',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'Aircraft unique identifier',
  })
  @ApiBody({ type: UpdateAircraftDto })
  @ApiOkResponse({
    description: 'Aircraft was updated successfully',
    type: Aircraft,
  })
  @ApiBadRequestResponse({
    description: 'Request validation failed',
    type: GenericBadRequestResponse<CreateAircraftDto>,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @ApiForbiddenResponse({
    description: 'User is not allowed to perform this action',
    type: ForbiddenRequest,
  })
  @ApiNotFoundResponse({
    description: 'Aircraft with given it does not exist',
    type: GenericNotFoundResponse,
  })
  @Patch(':id')
  @Role(UserRole.Operations)
  async update(
    @uuid('id') id: string,
    @Body() updateAircraftDto: UpdateAircraftDto,
  ): Promise<Aircraft> {
    return this.aircraftService.update(id, updateAircraftDto);
  }

  @ApiOperation({
    summary: 'Remove aircraft',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth()
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
    type: ForbiddenRequest,
  })
  @ApiNotFoundResponse({
    description: 'Aircraft with given it does not exist',
    type: GenericNotFoundResponse,
  })
  @Delete(':id')
  @Role(UserRole.Operations)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@uuid('id') id: string): Promise<void> {
    await this.aircraftService.remove(id);
  }
}
