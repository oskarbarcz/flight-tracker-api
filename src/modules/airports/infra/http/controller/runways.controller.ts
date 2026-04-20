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
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UserRole } from 'prisma/client/client';
import { v4 } from 'uuid';
import { UuidParam } from '../../../../../core/validation/uuid.param';
import { Role } from '../../../../../core/http/auth/decorator/role.decorator';
import { GenericBadRequestResponse } from '../../../../../core/http/response/bad-request.response';
import { GenericNotFoundResponse } from '../../../../../core/http/response/not-found.response';
import { ForbiddenResponse } from '../../../../../core/http/response/forbidden.response';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import {
  CreateRunwayRequest,
  GetRunwayResponse,
  UpdateRunwayRequest,
} from '../request/runway.dto';
import { CreateRunwayCommand } from '../../../application/command/runways/create-runway.command';
import { UpdateRunwayCommand } from '../../../application/command/runways/update-runway.command';
import { RemoveRunwayCommand } from '../../../application/command/runways/remove-runway.command';
import { GetRunwayByIdQuery } from '../../../application/query/runway/get-runway-by-id.query';
import { ListRunwaysByAirportQuery } from '../../../application/query/runway/list-runways-by-airport.query';

@ApiTags('airport runway')
@Controller('api/v1/airport/:airportId/runway')
export class RunwaysController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Create new runway at given airport',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'airportId', description: 'Airport unique identifier' })
  @ApiBody({ type: CreateRunwayRequest })
  @ApiCreatedResponse({ type: GetRunwayResponse })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Post()
  @Role(UserRole.Operations)
  async create(
    @UuidParam('airportId') airportId: string,
    @Body() body: CreateRunwayRequest,
  ): Promise<GetRunwayResponse> {
    const runwayId = v4();

    const command = new CreateRunwayCommand(airportId, runwayId, body);
    await this.commandBus.execute(command);

    const query = new GetRunwayByIdQuery(airportId, runwayId);
    return this.queryBus.execute(query);
  }

  @ApiOperation({ summary: 'Retrieve all runways at given airport' })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'airportId', description: 'Airport unique identifier' })
  @ApiOkResponse({ type: GetRunwayResponse, isArray: true })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Get()
  async findAll(
    @UuidParam('airportId') airportId: string,
  ): Promise<GetRunwayResponse[]> {
    const query = new ListRunwaysByAirportQuery(airportId);
    return this.queryBus.execute(query);
  }

  @ApiOperation({ summary: 'Retrieve one runway' })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'airportId', description: 'Airport unique identifier' })
  @ApiParam({ name: 'runwayId', description: 'Runway unique identifier' })
  @ApiOkResponse({ type: GetRunwayResponse })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Get(':runwayId')
  async findOne(
    @UuidParam('airportId') airportId: string,
    @UuidParam('runwayId') runwayId: string,
  ): Promise<GetRunwayResponse> {
    const query = new GetRunwayByIdQuery(airportId, runwayId);
    return this.queryBus.execute(query);
  }

  @ApiOperation({
    summary: 'Update runway',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'airportId', description: 'Airport unique identifier' })
  @ApiParam({ name: 'runwayId', description: 'Runway unique identifier' })
  @ApiBody({ type: UpdateRunwayRequest })
  @ApiOkResponse({ type: GetRunwayResponse })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Patch(':runwayId')
  @Role(UserRole.Operations)
  async update(
    @UuidParam('airportId') airportId: string,
    @UuidParam('runwayId') runwayId: string,
    @Body() body: UpdateRunwayRequest,
  ): Promise<GetRunwayResponse> {
    const command = new UpdateRunwayCommand(airportId, runwayId, body);
    await this.commandBus.execute(command);

    const query = new GetRunwayByIdQuery(airportId, runwayId);
    return this.queryBus.execute(query);
  }

  @ApiOperation({
    summary: 'Remove runway',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'airportId', description: 'Airport unique identifier' })
  @ApiParam({ name: 'runwayId', description: 'Runway unique identifier' })
  @ApiNoContentResponse()
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Delete(':runwayId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Role(UserRole.Operations)
  async remove(
    @UuidParam('airportId') airportId: string,
    @UuidParam('runwayId') runwayId: string,
  ): Promise<void> {
    const command = new RemoveRunwayCommand(airportId, runwayId);
    await this.commandBus.execute(command);
  }
}
