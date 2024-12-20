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

  @ApiOperation({
    summary: 'Check in pilot and set estimated timesheet',
    description:
      '**NOTE:** This action is only allowed for flights in ready status.',
  })
  @ApiParam({
    name: 'id',
    description: 'Flight unique identifier',
  })
  @ApiBody({
    description: 'Estimated timesheet',
    type: Schedule,
  })
  @ApiNoContentResponse({
    description: 'Pilot checked in successfully',
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
  @Post('/:id/check-in')
  @HttpCode(HttpStatus.NO_CONTENT)
  async checkInPilot(
    @uuid('id') id: string,
    @Body() schedule: Schedule,
  ): Promise<void> {
    await this.flightsService.checkInPilot(id, schedule);
  }

  @ApiOperation({
    summary: 'Report flight boarding has started',
    description:
      '**NOTE:** This action is only allowed for flights in checked-in status.',
  })
  @ApiParam({
    name: 'id',
    description: 'Flight unique identifier',
  })
  @ApiNoContentResponse({
    description: 'Boarding started successfully',
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
  @Post('/:id/start-boarding')
  @HttpCode(HttpStatus.NO_CONTENT)
  async startBoarding(@uuid('id') id: string): Promise<void> {
    await this.flightsService.startBoarding(id);
  }

  @ApiOperation({
    summary: 'Report flight boarding has finished',
    description:
      '**NOTE:** This action is only allowed for flights in boarding status.',
  })
  @ApiParam({
    name: 'id',
    description: 'Flight unique identifier',
  })
  @ApiNoContentResponse({
    description: 'Boarding finished successfully',
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
  @Post('/:id/finish-boarding')
  @HttpCode(HttpStatus.NO_CONTENT)
  async finishBoarding(@uuid('id') id: string): Promise<void> {
    await this.flightsService.finishBoarding(id);
  }

  @ApiOperation({
    summary: 'Report flight taxiing out has started',
    description:
      '**NOTE:** This action is only allowed when boarding is finished.',
  })
  @ApiParam({
    name: 'id',
    description: 'Flight unique identifier',
  })
  @ApiNoContentResponse({
    description: 'Off block reported successfully',
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
  @Post('/:id/report-off-block')
  @HttpCode(HttpStatus.NO_CONTENT)
  async reportOffBlock(@uuid('id') id: string): Promise<void> {
    await this.flightsService.reportOffBlock(id);
  }

  @ApiOperation({
    summary: 'Report flight taken off',
    description:
      '**NOTE:** This action is only allowed when off-block was reported.',
  })
  @ApiParam({
    name: 'id',
    description: 'Flight unique identifier',
  })
  @ApiNoContentResponse({
    description: 'Takeoff reported successfully',
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
  @Post('/:id/report-takeoff')
  @HttpCode(HttpStatus.NO_CONTENT)
  async reportTakeoff(@uuid('id') id: string): Promise<void> {
    await this.flightsService.reportTakeoff(id);
  }

  @ApiOperation({
    summary: 'Report flight has landed',
    description:
      '**NOTE:** This action is only allowed when aircraft has taken off.',
  })
  @ApiParam({
    name: 'id',
    description: 'Flight unique identifier',
  })
  @ApiNoContentResponse({
    description: 'Arrival reported successfully',
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
  @Post('/:id/report-arrival')
  @HttpCode(HttpStatus.NO_CONTENT)
  async reportArrival(@uuid('id') id: string): Promise<void> {
    await this.flightsService.reportArrival(id);
  }

  @ApiOperation({
    summary: 'Report that offboarding has been finished.',
    description:
      '**NOTE:** This action is only allowed when aircraft is offboarding passengers.',
  })
  @ApiParam({
    name: 'id',
    description: 'Flight unique identifier',
  })
  @ApiNoContentResponse({
    description: 'On block reported successfully',
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
  @Post('/:id/report-on-block')
  @HttpCode(HttpStatus.NO_CONTENT)
  async reportOnBlock(@uuid('id') id: string): Promise<void> {
    await this.flightsService.reportOnBlock(id);
  }

  @ApiOperation({
    summary: 'Start offboarding passengers',
    description:
      '**NOTE:** This action is only allowed if aircraft is on block.',
  })
  @ApiParam({
    name: 'id',
    description: 'Flight unique identifier',
  })
  @ApiNoContentResponse({
    description: 'Offboarding start reported successfully',
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
  @Post('/:id/start-offboarding')
  @HttpCode(HttpStatus.NO_CONTENT)
  async reportOffboardingStarted(@uuid('id') id: string): Promise<void> {
    await this.flightsService.reportOffboardingStarted(id);
  }

  @ApiOperation({
    summary: 'Finish offboarding passengers',
    description:
      '**NOTE:** This action is only allowed if offboarding was started.',
  })
  @ApiParam({
    name: 'id',
    description: 'Flight unique identifier',
  })
  @ApiNoContentResponse({
    description: 'Offboarding finish reported successfully',
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
  @Post('/:id/finish-offboarding')
  @HttpCode(HttpStatus.NO_CONTENT)
  async reportOffboardingFinished(@uuid('id') id: string): Promise<void> {
    await this.flightsService.reportOffboardingFinished(id);
  }

  @ApiOperation({
    summary: 'Close flight plan',
    description:
      '**NOTE:** This action is only allowed when offboarding has been finished.',
  })
  @ApiParam({
    name: 'id',
    description: 'Flight unique identifier',
  })
  @ApiNoContentResponse({
    description: 'Flight plan is closed successfully',
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
  @Post('/:id/close')
  @HttpCode(HttpStatus.NO_CONTENT)
  async closeFlightPlan(@uuid('id') id: string): Promise<void> {
    await this.flightsService.close(id);
  }
}
