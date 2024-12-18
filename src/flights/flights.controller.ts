import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
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
import { Schedule } from './entities/timesheet.entity';

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

  @ApiOperation({
    summary: 'Mark flight as ready',
    description: 'This action will allow pilot to start flight.',
  })
  @ApiParam({
    name: 'id',
    description: 'Flight unique identifier',
  })
  @ApiNoContentResponse({
    description: 'Flight was marked as ready successfully',
  })
  @ApiBadRequestResponse({
    description:
      'Flight id is not valid uuid v4 or domain logic error occurred',
    type: GenericBadRequestResponse,
  })
  @ApiNotFoundResponse({
    description: 'Flight with given it does not exist',
    type: GenericNotFoundResponse,
  })
  @Post('/:id/mark-as-ready')
  @HttpCode(HttpStatus.NO_CONTENT)
  async markAsReady(@uuid('id') id: string): Promise<void> {
    await this.flightsService.markAsReady(id);
  }

  @ApiOperation({
    summary: 'Update flight scheduled timesheet',
    description:
      '**NOTE:** This action is only allowed for flights in created status.',
  })
  @ApiParam({
    name: 'id',
    description: 'Flight unique identifier',
  })
  @ApiBody({
    description: 'New scheduled timesheet',
    type: Schedule,
  })
  @ApiNoContentResponse({
    description: 'Flight schedule was updated successfully',
  })
  @ApiBadRequestResponse({
    description:
      'Flight id is not valid uuid v4 or domain logic error occurred',
    type: GenericBadRequestResponse,
  })
  @ApiNotFoundResponse({
    description: 'Flight with given it does not exist',
    type: GenericNotFoundResponse,
  })
  @Patch('/:id/timesheet/scheduled')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateScheduledTimesheet(
    @uuid('id') id: string,
    @Body() schedule: Schedule,
  ): Promise<void> {
    await this.flightsService.updateScheduledTimesheet(id, schedule);
  }
}
