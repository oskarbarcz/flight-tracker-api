import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
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
import { GenericNotFoundResponse } from '../../../core/http/response/not-found.response';
import { UuidParam } from '../../../core/validation/uuid.param';
import {
  CreateFlightRequest,
  GetFlightResponse,
  ListFlightsFilters,
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
import { Query } from '@nestjs/common';
import { FlightPhase } from '../entity/flight.entity';

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
  @ApiParam({
    name: 'phase',
    type: 'string',
    enum: FlightPhase,
    required: false,
  })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({ type: GetFlightResponse, isArray: true })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @Get()
  findAll(@Query() filters: ListFlightsFilters): Promise<GetFlightResponse[]> {
    const query = new ListAllFlightsQuery(filters);
    return this.queryBus.execute(query);
  }

  @ApiOperation({ summary: 'Retrieve one flight' })
  @ApiOkResponse({
    description: 'Flight was found',
    type: GetFlightResponse,
  })
  @ApiBadRequestResponse({
    description: 'Flight id is not valid uuid v4',
    type: GenericBadRequestResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @ApiNotFoundResponse({
    description: 'Flight with given it does not exist',
    type: GenericNotFoundResponse,
  })
  @Get(':id')
  @SkipAuth()
  findOne(@UuidParam('id') id: string): Promise<GetFlightResponse> {
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
}
