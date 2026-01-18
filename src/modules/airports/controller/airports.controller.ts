import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { UuidParam } from '../../../core/validation/uuid.param';
import { Airport } from '../entity/airport.entity';
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
import { Role } from '../../../core/http/auth/decorator/role.decorator';
import { UserRole } from 'prisma/client/client';
import { ForbiddenResponse } from '../../../core/http/response/forbidden.response';
import { UnauthorizedResponse } from '../../../core/http/response/unauthorized.response';
import {
  AirportListFilters,
  CreateAirportRequest,
  GetAirportResponse,
  UpdateAirportResponse,
} from '../dto/airport.dto';
import { SkipAuth } from '../../../core/http/auth/decorator/skip-auth.decorator';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateAirportCommand } from '../application/command/create-airport.command';
import { UpdateAirportCommand } from '../application/command/update-airport.command';
import { RemoveAirportCommand } from '../application/command/remove-airport.command';
import { GetAirportByIdQuery } from '../application/query/get-airport-by-id.query';
import { ListAllAirportsQuery } from '../application/query/list-all-airports.query';

@ApiTags('airport')
@Controller('api/v1/airport')
export class AirportsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Create new airport',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiBody({ type: CreateAirportRequest })
  @ApiCreatedResponse({ type: Airport })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @Post()
  @Role(UserRole.Operations)
  async create(
    @Body() body: CreateAirportRequest,
  ): Promise<GetAirportResponse> {
    const command = new CreateAirportCommand(body);
    const airportId = await this.commandBus.execute(command);

    const query = new GetAirportByIdQuery(airportId);
    return this.queryBus.execute(query);
  }

  @ApiOperation({ summary: 'Retrieve all airports' })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'continent',
    required: false,
    description: 'Filter by continent',
  })
  @ApiOkResponse({
    type: GetAirportResponse,
    isArray: true,
  })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @SkipAuth()
  @Get()
  async findAll(
    @Query() filters: AirportListFilters,
  ): Promise<GetAirportResponse[]> {
    const query = new ListAllAirportsQuery(filters);
    return this.queryBus.execute(query);
  }

  @ApiOperation({ summary: 'Retrieve one airport' })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'id',
    description: 'Airport unique identifier',
  })
  @ApiOkResponse({ type: GetAirportResponse })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @Get(':id')
  async findOne(@UuidParam('id') id: string): Promise<GetAirportResponse> {
    const query = new GetAirportByIdQuery(id);
    return this.queryBus.execute(query);
  }

  @ApiOperation({
    summary: 'Update airport',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'id',
    description: 'Airport unique identifier',
  })
  @ApiBody({ type: UpdateAirportResponse })
  @ApiOkResponse({ type: GetAirportResponse })
  @ApiBadRequestResponse({
    type: GenericBadRequestResponse<CreateAirportRequest>,
  })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Patch(':id')
  @Role(UserRole.Operations)
  async update(
    @UuidParam('id') id: string,
    @Body() body: UpdateAirportResponse,
  ): Promise<GetAirportResponse> {
    const command = new UpdateAirportCommand(id, body);
    await this.commandBus.execute(command);

    const query = new GetAirportByIdQuery(id);
    return this.queryBus.execute(query);
  }

  @ApiOperation({
    summary: 'Remove airport',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'id',
    description: 'Airport unique identifier',
  })
  @ApiNoContentResponse()
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Role(UserRole.Operations)
  async remove(@UuidParam('id') id: string): Promise<void> {
    const command = new RemoveAirportCommand(id);
    await this.commandBus.execute(command);
  }
}
