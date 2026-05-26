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
import { SkipAuth } from '../../../../../core/http/auth/decorator/skip-auth.decorator';
import { GenericBadRequestResponse } from '../../../../../core/http/response/bad-request.response';
import { GenericNotFoundResponse } from '../../../../../core/http/response/not-found.response';
import { ForbiddenResponse } from '../../../../../core/http/response/forbidden.response';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import {
  CreateGateRequest,
  GetGateResponse,
  UpdateGateRequest,
} from '../request/gate.dto';
import { CreateGateCommand } from '../../../application/command/gates/create-gate.command';
import { UpdateGateCommand } from '../../../application/command/gates/update-gate.command';
import { RemoveGateCommand } from '../../../application/command/gates/remove-gate.command';
import { GetGateByIdQuery } from '../../../application/query/gate/get-gate-by-id.query';
import { ListGatesByAirportQuery } from '../../../application/query/gate/list-gates-by-airport.query';

@ApiTags('airport gate')
@Controller('api/v1/airport/:airportId/gate')
export class GatesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Create new gate at given airport',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'airportId', description: 'Airport unique identifier' })
  @ApiBody({ type: CreateGateRequest })
  @ApiCreatedResponse({ type: GetGateResponse })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Post()
  @Role(UserRole.Operations)
  async create(
    @UuidParam('airportId') airportId: string,
    @Body() body: CreateGateRequest,
  ): Promise<GetGateResponse> {
    const gateId = v4();

    const command = new CreateGateCommand(airportId, gateId, body);
    await this.commandBus.execute(command);

    const query = new GetGateByIdQuery(airportId, gateId);
    return this.queryBus.execute(query);
  }

  @ApiOperation({ summary: 'Retrieve all gates at given airport' })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'airportId', description: 'Airport unique identifier' })
  @ApiOkResponse({ type: GetGateResponse, isArray: true })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @SkipAuth()
  @Get()
  async findAll(
    @UuidParam('airportId') airportId: string,
  ): Promise<GetGateResponse[]> {
    const query = new ListGatesByAirportQuery(airportId);
    return this.queryBus.execute(query);
  }

  @ApiOperation({ summary: 'Retrieve one gate' })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'airportId', description: 'Airport unique identifier' })
  @ApiParam({ name: 'gateId', description: 'Gate unique identifier' })
  @ApiOkResponse({ type: GetGateResponse })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @SkipAuth()
  @Get(':gateId')
  async findOne(
    @UuidParam('airportId') airportId: string,
    @UuidParam('gateId') gateId: string,
  ): Promise<GetGateResponse> {
    const query = new GetGateByIdQuery(airportId, gateId);
    return this.queryBus.execute(query);
  }

  @ApiOperation({
    summary: 'Update gate',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'airportId', description: 'Airport unique identifier' })
  @ApiParam({ name: 'gateId', description: 'Gate unique identifier' })
  @ApiBody({ type: UpdateGateRequest })
  @ApiOkResponse({ type: GetGateResponse })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Patch(':gateId')
  @Role(UserRole.Operations)
  async update(
    @UuidParam('airportId') airportId: string,
    @UuidParam('gateId') gateId: string,
    @Body() body: UpdateGateRequest,
  ): Promise<GetGateResponse> {
    const command = new UpdateGateCommand(airportId, gateId, body);
    await this.commandBus.execute(command);

    const query = new GetGateByIdQuery(airportId, gateId);
    return this.queryBus.execute(query);
  }

  @ApiOperation({
    summary: 'Remove gate',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'airportId', description: 'Airport unique identifier' })
  @ApiParam({ name: 'gateId', description: 'Gate unique identifier' })
  @ApiNoContentResponse()
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Delete(':gateId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Role(UserRole.Operations)
  async remove(
    @UuidParam('airportId') airportId: string,
    @UuidParam('gateId') gateId: string,
  ): Promise<void> {
    const command = new RemoveGateCommand(airportId, gateId);
    await this.commandBus.execute(command);
  }
}
