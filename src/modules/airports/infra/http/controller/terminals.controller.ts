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
import { UuidParam } from '../../../../../core/validation/uuid.param';
import { Role } from '../../../../../core/http/auth/decorator/role.decorator';
import { GenericBadRequestResponse } from '../../../../../core/http/response/bad-request.response';
import { GenericNotFoundResponse } from '../../../../../core/http/response/not-found.response';
import { ForbiddenResponse } from '../../../../../core/http/response/forbidden.response';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import {
  CreateTerminalRequest,
  GetTerminalResponse,
  UpdateTerminalRequest,
} from '../request/terminal.dto';
import { CreateTerminalCommand } from '../../../application/command/terminals/create-terminal.command';
import { UpdateTerminalCommand } from '../../../application/command/terminals/update-terminal.command';
import { RemoveTerminalCommand } from '../../../application/command/terminals/remove-terminal.command';
import { GetTerminalByIdQuery } from '../../../application/query/get-terminal-by-id.query';
import { ListTerminalsByAirportQuery } from '../../../application/query/list-terminals-by-airport.query';
import { v4 } from 'uuid';

@ApiTags('airport terminal')
@Controller('api/v1/airport/:airportId/terminal')
export class TerminalsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Create new terminal at given airport',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'airportId', description: 'Airport unique identifier' })
  @ApiBody({ type: CreateTerminalRequest })
  @ApiCreatedResponse({ type: GetTerminalResponse })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Post()
  @Role(UserRole.Operations)
  async create(
    @UuidParam('airportId') airportId: string,
    @Body() body: CreateTerminalRequest,
  ): Promise<GetTerminalResponse> {
    const terminalId = v4();

    const command = new CreateTerminalCommand(airportId, terminalId, body);
    await this.commandBus.execute(command);

    const query = new GetTerminalByIdQuery(airportId, terminalId);
    return this.queryBus.execute(query);
  }

  @ApiOperation({ summary: 'Retrieve all terminals at given airport' })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'airportId', description: 'Airport unique identifier' })
  @ApiOkResponse({ type: GetTerminalResponse, isArray: true })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Get()
  async findAll(
    @UuidParam('airportId') airportId: string,
  ): Promise<GetTerminalResponse[]> {
    const query = new ListTerminalsByAirportQuery(airportId);
    return this.queryBus.execute(query);
  }

  @ApiOperation({ summary: 'Retrieve one terminal' })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'airportId', description: 'Airport unique identifier' })
  @ApiParam({ name: 'terminalId', description: 'Terminal unique identifier' })
  @ApiOkResponse({ type: GetTerminalResponse })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Get(':terminalId')
  async findOne(
    @UuidParam('airportId') airportId: string,
    @UuidParam('terminalId') terminalId: string,
  ): Promise<GetTerminalResponse> {
    const query = new GetTerminalByIdQuery(airportId, terminalId);
    return this.queryBus.execute(query);
  }

  @ApiOperation({
    summary: 'Update terminal',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'airportId', description: 'Airport unique identifier' })
  @ApiParam({ name: 'terminalId', description: 'Terminal unique identifier' })
  @ApiBody({ type: UpdateTerminalRequest })
  @ApiOkResponse({ type: GetTerminalResponse })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Patch(':terminalId')
  @Role(UserRole.Operations)
  async update(
    @UuidParam('airportId') airportId: string,
    @UuidParam('terminalId') terminalId: string,
    @Body() body: UpdateTerminalRequest,
  ): Promise<GetTerminalResponse> {
    const command = new UpdateTerminalCommand(airportId, terminalId, body);
    await this.commandBus.execute(command);

    const query = new GetTerminalByIdQuery(airportId, terminalId);
    return this.queryBus.execute(query);
  }

  @ApiOperation({
    summary: 'Remove terminal',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'airportId', description: 'Airport unique identifier' })
  @ApiParam({ name: 'terminalId', description: 'Terminal unique identifier' })
  @ApiNoContentResponse()
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Delete(':terminalId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Role(UserRole.Operations)
  async remove(
    @UuidParam('airportId') airportId: string,
    @UuidParam('terminalId') terminalId: string,
  ): Promise<void> {
    const command = new RemoveTerminalCommand(airportId, terminalId);
    await this.commandBus.execute(command);
  }
}
