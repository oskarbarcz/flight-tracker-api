import { Body, Controller, Get, Post } from '@nestjs/common';
import { FlightsService } from './flights.service';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { GenericBadRequestResponse } from '../common/dto/bad-request.dto';
import { GenericNotFoundResponse } from '../common/dto/not-found.dto';
import { uuid } from '../common/validation/uuid.param';
import { Flight } from './entities/flight.entity';
import { CreateFlightRequest } from './dto/create-flight.dto';

@ApiTags('flight')
@Controller('api/v1/flight')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @ApiOperation({ summary: 'Retrieve one flight' })
  @ApiParam({
    name: 'id',
    description: 'Flight unique identifier',
  })
  @ApiOkResponse({
    description: 'Flight was found',
    type: Flight,
  })
  @ApiBadRequestResponse({
    description: 'Flight id is not valid uuid v4',
    type: GenericBadRequestResponse,
  })
  @ApiNotFoundResponse({
    description: 'Flight with given it does not exist',
    type: GenericNotFoundResponse,
  })
  @Get(':id')
  findOne(@uuid('id') id: string) {
    return this.flightsService.find(id);
  }

  @ApiOperation({ summary: 'Create a flight' })
  @ApiBody({
    type: CreateFlightRequest,
  })
  @ApiOkResponse({
    description: 'Flight was created',
    type: Flight,
  })
  @Post()
  async create(@Body() input: CreateFlightRequest) {
    return this.flightsService.create(input);
  }
}
