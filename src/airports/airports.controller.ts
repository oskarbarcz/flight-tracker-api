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
import { AirportsService } from './airports.service';
import { CreateAirportDto } from './dto/create-airport.dto';
import { UpdateAirportDto } from './dto/update-airport.dto';
import { uuid } from '../common/validation/uuid.param';
import { Airport } from './entities/airport.entity';
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
import { GenericNotFoundResponse } from '../common/dto/not-found.dto';

@ApiTags('airport')
@Controller('api/v1/airport')
export class AirportsController {
  constructor(private readonly airportsService: AirportsService) {}

  @ApiOperation({ summary: 'Create new airport' })
  @ApiBody({
    description: 'Airport data',
    type: CreateAirportDto,
  })
  @ApiCreatedResponse({
    description: 'Airport was created successfully',
    type: Airport,
  })
  @ApiBadRequestResponse({
    description: 'Request validation failed',
    type: GenericBadRequestResponse<CreateAirportDto>,
  })
  @Post()
  async create(@Body() createAirportDto: CreateAirportDto): Promise<Airport> {
    return this.airportsService.create(createAirportDto);
  }

  @ApiOperation({ summary: 'Retrieve all airports' })
  @ApiOkResponse({
    description: 'Airports list',
    type: Airport,
    isArray: true,
  })
  @Get()
  async findAll(): Promise<Airport[]> {
    return this.airportsService.findAll();
  }

  @ApiOperation({ summary: 'Retrieve one airport' })
  @ApiParam({
    name: 'id',
    description: 'Airport unique identifier',
  })
  @ApiOkResponse({
    description: 'Airport was created successfully',
    type: Airport,
  })
  @ApiBadRequestResponse({
    description: 'Aircraft id is not valid uuid v4',
    type: GenericBadRequestResponse,
  })
  @ApiNotFoundResponse({
    description: 'Airport with given it does not exist',
    type: GenericNotFoundResponse,
  })
  @Get(':id')
  async findOne(@uuid('id') id: string): Promise<Airport> {
    return this.airportsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update airport' })
  @ApiParam({
    name: 'id',
    description: 'Airport unique identifier',
  })
  @ApiBody({
    description: 'Airport data',
    type: UpdateAirportDto,
  })
  @ApiOkResponse({
    description: 'Airport was updated successfully',
    type: Airport,
  })
  @ApiBadRequestResponse({
    description: 'Request validation failed',
    type: GenericBadRequestResponse<CreateAirportDto>,
  })
  @ApiNotFoundResponse({
    description: 'Airport with given it does not exist',
    type: GenericNotFoundResponse,
  })
  @Patch(':id')
  async update(
    @uuid('id') id: string,
    @Body() updateAirportDto: UpdateAirportDto,
  ): Promise<Airport> {
    return this.airportsService.update(id, updateAirportDto);
  }

  @ApiOperation({ summary: 'Remove airport' })
  @ApiParam({
    name: 'id',
    description: 'Airport unique identifier',
  })
  @ApiNoContentResponse({
    description: 'Airport was removed successfully',
  })
  @ApiBadRequestResponse({
    description: 'Airport id is not valid uuid v4',
    type: GenericBadRequestResponse,
  })
  @ApiNotFoundResponse({
    description: 'Airport with given it does not exist',
    type: GenericNotFoundResponse,
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@uuid('id') id: string): Promise<void> {
    return this.airportsService.remove(id);
  }
}
