import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
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
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { GenericBadRequestResponse } from '../../../core/http/response/bad-request.response';
import { GenericNotFoundResponse } from '../../../core/http/response/not-found.response';
import { UuidParam } from '../../../core/validation/uuid.param';
import {
  CreateFlightRequest,
  FlightListFilters,
  GetFlightResponse,
  UpdateFlightVisibilityRequest,
} from '../dto/flight.dto';
import { UnauthorizedResponse } from '../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../core/http/response/forbidden.response';
import { Role } from '../../../core/http/auth/decorator/role.decorator';
import { UserRole } from 'prisma/client/client';
import { AuthorizedRequest } from '../../../core/http/request/authorized.request';
import { SkipAuth } from '../../../core/http/auth/decorator/skip-auth.decorator';
import { GetFlightByIdQuery } from '../application/query/get-flight-by-id.query';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ListAllFlightsQuery } from '../application/query/list-all-flights.query';
import { RemoveFlightCommand } from '../application/command/remove-flight.command';
import { CreateFlightCommand } from '../application/command/create-flight.command';
import { v4 } from 'uuid';
import { CreateFlightFromSimbriefCommand } from '../application/command/create-flight-from-simbrief.command';
import { FlightPhase, FlightTracking } from '../entity/flight.entity';
import { FlightDoesNotExistError } from '../dto/errors.dto';
import { GetFlightTrackingQuery } from '../application/query/get-flight-tracking.query';
import { Schedule } from '../entity/timesheet.entity';
import { UpdateScheduledTimesheetCommand } from '../application/command/update-scheduled-timesheet.command';
import { UpdatePreliminaryLoadsheetCommand } from '../application/command/update-preliminary-loadsheet.command';
import { Loadsheet } from '../entity/loadsheet.entity';
import { ChangeFlightVisibilityCommand } from '../application/command/change-flight-visibility.command';

@ApiTags('flight')
@Controller('api/v1/flight')
export class ManagementController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @ApiOperation({
    summary: 'Create a flight with SimBrief data',
    description:
      '**NOTE:** This endpoint is only available for users with the ` operations ` role. <br />' +
      '**NOTE:** Simbrief ID must be provided for the user, otherwise import will throw HTTP 400.',
  })
  @ApiBearerAuth('jwt')
  @ApiCreatedResponse({
    description: 'Flight was created',
    type: GetFlightResponse,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
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
    description: 'Airports or aircraft does not exist',
    type: GenericNotFoundResponse,
  })
  @Post('/create-with-simbrief')
  @Role(UserRole.Operations)
  async createWithSimbrief(
    @Req() request: AuthorizedRequest,
  ): Promise<GetFlightResponse> {
    const flightId = v4();

    const command = new CreateFlightFromSimbriefCommand(
      flightId,
      request.user.sub,
    );
    await this.commandBus.execute(command);

    const getFlightQuery = new GetFlightByIdQuery(flightId);
    return this.queryBus.execute(getFlightQuery);
  }

  @ApiOperation({ summary: 'Retrieve all flights' })
  @ApiQuery({
    name: 'phase',
    description: 'Filter by flight phase',
    type: 'string',
    enum: FlightPhase,
    required: false,
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number',
    type: 'number',
    minimum: 1,
    default: 1,
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Maximum number of items to return',
    type: 'number',
    minimum: 1,
    maximum: 100,
    default: 10,
    required: false,
  })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({
    type: GetFlightResponse,
    isArray: true,
    headers: {
      'X-Total-Count': {
        description: 'Total number of flights',
        schema: { type: 'number' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @Get()
  @SkipAuth()
  async findAll(
    @Req() request: AuthorizedRequest,
    @Query() filters: FlightListFilters,
    @Res() response: Response,
  ): Promise<void> {
    const onlyPublic = !Boolean(request.user);
    const query = new ListAllFlightsQuery(onlyPublic, filters);
    const { flights, totalCount } = await this.queryBus.execute(query);

    response.setHeader('X-Total-Count', totalCount.toString());
    response.json(flights);
  }

  @ApiOperation({ summary: 'Retrieve one flight' })
  @ApiParam({
    name: 'id',
    description: 'Flight unique identifier',
  })
  @ApiOkResponse({
    description: 'Flight was found',
    type: GetFlightResponse,
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
  @SkipAuth()
  async findOne(
    @Req() request: AuthorizedRequest,
    @UuidParam('id') id: string,
  ): Promise<GetFlightResponse> {
    const tracking = await this.queryBus.execute(
      new GetFlightTrackingQuery(id),
    );

    if (!tracking) {
      throw new NotFoundException(FlightDoesNotExistError);
    }

    if (!request.user && tracking === FlightTracking.Private) {
      throw new NotFoundException(FlightDoesNotExistError);
    }

    const query = new GetFlightByIdQuery(id);
    return this.queryBus.execute(query);
  }

  @ApiOperation({
    summary: 'Create a flight',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiBody({ type: CreateFlightRequest })
  @ApiCreatedResponse({
    description: 'Flight was created',
    type: GetFlightResponse,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
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
    description: 'Airports or aircraft does not exist',
    type: GenericNotFoundResponse,
  })
  @Post()
  @Role(UserRole.Operations)
  async create(
    @Req() request: AuthorizedRequest,
    @Body() input: CreateFlightRequest,
  ): Promise<GetFlightResponse> {
    const flightId = v4();

    const command = new CreateFlightCommand(flightId, input, request.user.sub);
    await this.commandBus.execute(command);

    const query = new GetFlightByIdQuery(flightId);
    return this.queryBus.execute(query);
  }

  @ApiOperation({
    summary: 'Remove a flight',
    description:
      '**NOTE:** Flight that has been scheduled cannot be removed. <br />' +
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
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
  @Delete(':id')
  @Role(UserRole.Operations)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@UuidParam('id') id: string): Promise<void> {
    const command = new RemoveFlightCommand(id);
    await this.commandBus.execute(command);
  }

  @ApiOperation({
    summary: 'Update flight preliminary loadsheet',
    description:
      '**NOTE:** This action is only allowed for flights in created status. <br />' +
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
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
    @Req() request: AuthorizedRequest,
    @Body() loadsheet: Loadsheet,
  ): Promise<void> {
    const command = new UpdatePreliminaryLoadsheetCommand(
      id,
      request.user.sub,
      loadsheet,
    );
    await this.commandBus.execute(command);
  }

  @ApiOperation({
    summary: 'Update flight scheduled timesheet',
    description:
      '**NOTE:** This action is only allowed for flights in created status. <br />' +
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
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
    @Req() request: AuthorizedRequest,
    @Body() schedule: Schedule,
  ): Promise<void> {
    const command = new UpdateScheduledTimesheetCommand(
      id,
      request.user.sub,
      schedule,
    );
    await this.commandBus.execute(command);
  }

  @ApiOperation({
    summary: 'Change flight visibility settings',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'id',
    description: 'Flight unique identifier',
  })
  @ApiBody({
    description: 'New visibility settings',
    type: UpdateFlightVisibilityRequest,
  })
  @ApiNoContentResponse({
    description: 'Flight tracking visibility was changed successfully',
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
  @Patch('/:id/tracking')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Role(UserRole.Operations)
  async changeVisibility(
    @UuidParam('id') id: string,
    @Body() body: UpdateFlightVisibilityRequest,
  ): Promise<void> {
    const command = new ChangeFlightVisibilityCommand(id, body.tracking);
    await this.commandBus.execute(command);
  }
}
