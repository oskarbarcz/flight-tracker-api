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
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { GenericBadRequestResponse } from '../common/dto/bad-request.dto';
import { uuid } from '../common/validation/uuid.param';
import { GenericNotFoundResponse } from '../common/dto/not-found.dto';

@ApiTags('aircraft')
@Controller('/api/v1/aircraft')
export class AircraftController {
  constructor(private readonly aircraftService: AircraftService) {}

  @ApiOperation({ summary: 'Create new aircraft' })
  @ApiBody({
    description: 'Aircraft data',
    type: CreateAircraftDto,
  })
  @ApiCreatedResponse({
    description: 'Aircraft was created successfully',
    type: Aircraft,
  })
  @ApiBadRequestResponse({
    description: 'Request validation failed',
    type: GenericBadRequestResponse<CreateAircraftDto>,
  })
  @Post()
  async create(
    @Body() createAircraftDto: CreateAircraftDto,
  ): Promise<Aircraft> {
    return await this.aircraftService.create(createAircraftDto);
  }

  @ApiOperation({ summary: 'Retrieve all aircraft' })
  @ApiOkResponse({
    description: 'Aircraft list',
    type: Aircraft,
  })
  @Get()
  async findAll(): Promise<Aircraft[]> {
    return this.aircraftService.findAll();
  }

  @ApiOperation({ summary: 'Retrieve one aircraft' })
  @ApiParam({
    name: 'id',
    description: 'Aircraft unique identifier',
  })
  @ApiOkResponse({
    description: 'Aircraft was created successfully',
    type: Aircraft,
  })
  @ApiNotFoundResponse({
    description: 'Aircraft with given it does not exist',
    type: GenericNotFoundResponse,
  })
  @Get(':id')
  async findOne(@uuid('id') id: string): Promise<Aircraft> {
    return this.aircraftService.findOne(id);
  }

  @ApiOperation({ summary: 'Update aircraft' })
  @ApiParam({
    name: 'id',
    description: 'Aircraft unique identifier',
  })
  @ApiBody({
    description: 'Aircraft data',
    type: UpdateAircraftDto,
  })
  @ApiOkResponse({
    description: 'Aircraft was updated successfully',
    type: Aircraft,
  })
  @ApiBadRequestResponse({
    description: 'Request validation failed',
    type: GenericBadRequestResponse<CreateAircraftDto>,
  })
  @ApiNotFoundResponse({
    description: 'Aircraft with given it does not exist',
    type: GenericNotFoundResponse,
  })
  @Patch(':id')
  async update(
    @uuid('id') id: string,
    @Body() updateAircraftDto: UpdateAircraftDto,
  ): Promise<Aircraft> {
    return this.aircraftService.update(id, updateAircraftDto);
  }

  @ApiOperation({ summary: 'Remove aircraft' })
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
  @ApiNotFoundResponse({
    description: 'Aircraft with given it does not exist',
    type: GenericNotFoundResponse,
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@uuid('id') id: string): Promise<void> {
    await this.aircraftService.remove(id);
  }
}
