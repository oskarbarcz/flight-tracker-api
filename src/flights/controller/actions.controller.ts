import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { FlightsService } from '../service/flights.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { GenericBadRequestResponse } from '../../common/response/bad-request.response';
import { GenericNotFoundResponse } from '../../common/response/not-found.response';
import { UuidParam } from '../../common/validation/uuid.param';
import { Schedule } from '../entities/timesheet.entity';
import { UnauthorizedResponse } from '../../common/response/unauthorized.response';
import { ForbiddenResponse } from '../../common/response/forbidden.response';
import { Role } from '../../auth/decorator/role.decorator';
import { UserRole } from '@prisma/client';
import { AuthorizedRequest } from '../../common/request/authorized.request';
import { Loadsheet } from '../entities/loadsheet.entity';

@ApiTags('flight-actions')
@Controller('api/v1/flight')
export class ActionsController {
  constructor(private readonly flightsService: FlightsService) {}

  @ApiOperation({
    summary: 'Mark flight as ready',
    description:
      'This action will allow pilot to start flight. <br />' +
      '**NOTE:** This action is only allowed for flights in `scheduled` status. <br />' +
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth()
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
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @ApiForbiddenResponse({
    description: 'User is not allowed to perform this action',
    type: ForbiddenResponse,
  })
  @ApiNotFoundResponse({
    description: 'Flight with given it does not exist',
    type: GenericNotFoundResponse,
  })
  @Post('/:id/mark-as-ready')
  @Role(UserRole.Operations)
  @HttpCode(HttpStatus.NO_CONTENT)
  async markAsReady(@UuidParam('id') id: string): Promise<void> {
    await this.flightsService.markAsReady(id);
  }

  @ApiOperation({
    summary: 'Update flight preliminary loadsheet',
    description:
      '**NOTE:** This action is only allowed for flights in created status. <br />' +
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'Flight unique identifier',
  })
  @ApiBody({
    description: 'Updated preliminary loadsheet',
    type: Loadsheet,
  })
  @ApiNoContentResponse({
    description: 'Flight loadsheet was updated successfully',
  })
  @ApiBadRequestResponse({
    description:
      'Flight id is not valid uuid v4 or domain logic error occurred',
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
    description: 'Flight with given it does not exist',
    type: GenericNotFoundResponse,
  })
  @Patch('/:id/loadsheet/preliminary')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Role(UserRole.Operations)
  async updatePreliminaryLoadsheet(
    @UuidParam('id') id: string,
    @Body() loadsheet: Loadsheet,
  ): Promise<void> {
    await this.flightsService.updatePreliminaryLoadsheet(id, loadsheet);
  }

  @ApiOperation({
    summary: 'Update flight scheduled timesheet',
    description:
      '**NOTE:** This action is only allowed for flights in created status. <br />' +
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth()
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
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @ApiForbiddenResponse({
    description: 'User is not allowed to perform this action',
    type: ForbiddenResponse,
  })
  @ApiNotFoundResponse({
    description: 'Flight with given it does not exist',
    type: GenericNotFoundResponse,
  })
  @Patch('/:id/timesheet/scheduled')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Role(UserRole.Operations)
  async updateScheduledTimesheet(
    @UuidParam('id') id: string,
    @Body() schedule: Schedule,
  ): Promise<void> {
    await this.flightsService.updateScheduledTimesheet(id, schedule);
  }

  @ApiOperation({
    summary: 'Check in pilot and set estimated timesheet',
    description:
      '**NOTE:** This action is only allowed for flights in ready status. <br />' +
      '**NOTE:** This endpoint is only available for users with `cabin crew` role.',
  })
  @ApiBearerAuth()
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
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @ApiForbiddenResponse({
    description: 'User is not allowed to perform this action',
    type: ForbiddenResponse,
  })
  @ApiNotFoundResponse({
    description: 'Flight with given it does not exist',
    type: GenericNotFoundResponse,
  })
  @Post('/:id/check-in')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Role(UserRole.CabinCrew)
  async checkInPilot(
    @UuidParam('id') id: string,
    @Body() schedule: Schedule,
    @Req() request: AuthorizedRequest,
  ): Promise<void> {
    await this.flightsService.checkInPilot(id, schedule, request.user.sub);
  }

  @ApiOperation({
    summary: 'Report flight boarding has started',
    description:
      '**NOTE:** This action is only allowed for flights in checked-in status. <br />' +
      '**NOTE:** This endpoint is only available for users with `cabin crew` role.',
  })
  @ApiBearerAuth()
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
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @ApiForbiddenResponse({
    description: 'User is not allowed to perform this action',
    type: ForbiddenResponse,
  })
  @ApiNotFoundResponse({
    description: 'Flight with given it does not exist',
    type: GenericNotFoundResponse,
  })
  @Post('/:id/start-boarding')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Role(UserRole.CabinCrew)
  async startBoarding(@UuidParam('id') id: string): Promise<void> {
    await this.flightsService.startBoarding(id);
  }

  @ApiOperation({
    summary: 'Report flight boarding has finished',
    description:
      '**NOTE:** This action is only allowed for flights in boarding status. <br />' +
      '**NOTE:** This endpoint is only available for users with `cabin crew` role.',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'Flight unique identifier',
  })
  @ApiBody({
    description: 'Final loadsheet',
    type: Loadsheet,
  })
  @ApiNoContentResponse({
    description: 'Boarding finished successfully',
  })
  @ApiBadRequestResponse({
    description:
      'Flight id is not valid uuid v4 or domain logic error occurred',
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
    description: 'Flight with given it does not exist',
    type: GenericNotFoundResponse,
  })
  @Post('/:id/finish-boarding')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Role(UserRole.CabinCrew)
  async finishBoarding(
    @UuidParam('id') id: string,
    @Body() loadsheet: Loadsheet,
  ): Promise<void> {
    await this.flightsService.finishBoarding(id, loadsheet);
  }

  @ApiOperation({
    summary: 'Report flight taxiing out has started',
    description:
      '**NOTE:** This action is only allowed when boarding is finished. <br />' +
      '**NOTE:** This endpoint is only available for users with `cabin crew` role.',
  })
  @ApiBearerAuth()
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
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @ApiForbiddenResponse({
    description: 'User is not allowed to perform this action',
    type: ForbiddenResponse,
  })
  @ApiNotFoundResponse({
    description: 'Flight with given it does not exist',
    type: GenericNotFoundResponse,
  })
  @Post('/:id/report-off-block')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Role(UserRole.CabinCrew)
  async reportOffBlock(@UuidParam('id') id: string): Promise<void> {
    await this.flightsService.reportOffBlock(id);
  }

  @ApiOperation({
    summary: 'Report flight taken off',
    description:
      '**NOTE:** This action is only allowed when off-block was reported. <br />' +
      '**NOTE:** This endpoint is only available for users with `cabin crew` role.',
  })
  @ApiBearerAuth()
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
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @ApiForbiddenResponse({
    description: 'User is not allowed to perform this action',
    type: ForbiddenResponse,
  })
  @ApiNotFoundResponse({
    description: 'Flight with given it does not exist',
    type: GenericNotFoundResponse,
  })
  @Post('/:id/report-takeoff')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Role(UserRole.CabinCrew)
  async reportTakeoff(@UuidParam('id') id: string): Promise<void> {
    await this.flightsService.reportTakeoff(id);
  }

  @ApiOperation({
    summary: 'Report flight has landed',
    description:
      '**NOTE:** This action is only allowed when aircraft has taken off. <br />' +
      '**NOTE:** This endpoint is only available for users with `cabin crew` role.',
  })
  @ApiBearerAuth()
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
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @ApiForbiddenResponse({
    description: 'User is not allowed to perform this action',
    type: ForbiddenResponse,
  })
  @ApiNotFoundResponse({
    description: 'Flight with given it does not exist',
    type: GenericNotFoundResponse,
  })
  @Post('/:id/report-arrival')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Role(UserRole.CabinCrew)
  async reportArrival(@UuidParam('id') id: string): Promise<void> {
    await this.flightsService.reportArrival(id);
  }

  @ApiOperation({
    summary: 'Report that offboarding has been finished.',
    description:
      '**NOTE:** This action is only allowed when aircraft is offboarding passengers. <br />' +
      '**NOTE:** This endpoint is only available for users with `cabin crew` role.',
  })
  @ApiBearerAuth()
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
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @ApiForbiddenResponse({
    description: 'User is not allowed to perform this action',
    type: ForbiddenResponse,
  })
  @ApiNotFoundResponse({
    description: 'Flight with given it does not exist',
    type: GenericNotFoundResponse,
  })
  @Post('/:id/report-on-block')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Role(UserRole.CabinCrew)
  async reportOnBlock(@UuidParam('id') id: string): Promise<void> {
    await this.flightsService.reportOnBlock(id);
  }

  @ApiOperation({
    summary: 'Start offboarding passengers',
    description:
      '**NOTE:** This action is only allowed if aircraft is on block. <br />' +
      '**NOTE:** This endpoint is only available for users with `cabin crew` role.',
  })
  @ApiBearerAuth()
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
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @ApiForbiddenResponse({
    description: 'User is not allowed to perform this action',
    type: ForbiddenResponse,
  })
  @ApiNotFoundResponse({
    description: 'Flight with given it does not exist',
    type: GenericNotFoundResponse,
  })
  @Post('/:id/start-offboarding')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Role(UserRole.CabinCrew)
  async reportOffboardingStarted(@UuidParam('id') id: string): Promise<void> {
    await this.flightsService.reportOffboardingStarted(id);
  }

  @ApiOperation({
    summary: 'Finish offboarding passengers',
    description:
      '**NOTE:** This action is only allowed if offboarding was started. <br />' +
      '**NOTE:** This endpoint is only available for users with `cabin crew` role.',
  })
  @ApiBearerAuth()
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
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @ApiForbiddenResponse({
    description: 'User is not allowed to perform this action',
    type: ForbiddenResponse,
  })
  @ApiNotFoundResponse({
    description: 'Flight with given it does not exist',
    type: GenericNotFoundResponse,
  })
  @Post('/:id/finish-offboarding')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Role(UserRole.CabinCrew)
  async reportOffboardingFinished(@UuidParam('id') id: string): Promise<void> {
    await this.flightsService.reportOffboardingFinished(id);
  }

  @ApiOperation({
    summary: 'Close flight plan',
    description:
      '**NOTE:** This action is only allowed when offboarding has been finished. <br />' +
      '**NOTE:** This endpoint is only available for users with `cabin crew` role.',
  })
  @ApiBearerAuth()
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
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @ApiForbiddenResponse({
    description: 'User is not allowed to perform this action',
    type: ForbiddenResponse,
  })
  @ApiNotFoundResponse({
    description: 'Flight with given it does not exist',
    type: GenericNotFoundResponse,
  })
  @Post('/:id/close')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Role(UserRole.CabinCrew)
  async closeFlightPlan(
    @UuidParam('id') id: string,
    @Req() request: AuthorizedRequest,
  ): Promise<void> {
    await this.flightsService.close(id, request.user.sub);
  }
}
