import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { FlightsService } from './flights.service';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNoContentResponse,
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
  @ApiBadRequestResponse({
    description: 'Validation failed',
    type: GenericBadRequestResponse,
  })
  @ApiNotFoundResponse({
    description: 'Airports or aircraft does not exist',
    type: GenericNotFoundResponse,
  })
  @Post()
  async create(@Body() input: CreateFlightRequest) {
    return this.flightsService.create(input);
  }

  @ApiOperation({
    summary: 'Remove a flight',
    description: '**NOTE:** Flight that has been scheduled cannot be removed.',
  })
  @ApiParam({
    name: 'id',
    description: 'Flight unique identifier',
  })
  @ApiNoContentResponse({
    description: 'Flight was removed successfully',
  })
  @ApiBadRequestResponse({
    description:
      'Flight id is not valid uuid v4 or flight has been scheduled and cannot be removed',
    type: GenericBadRequestResponse,
  })
  @ApiNotFoundResponse({
    description: 'Flight with given it does not exist',
    type: GenericNotFoundResponse,
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@uuid('id') id: string): Promise<void> {
    await this.flightsService.remove(id);
  }
}
