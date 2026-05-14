import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { UserRole } from 'prisma/client/client';

import {
  DeclareEmergencyRequest,
  GetEmergencyResponse,
  UpdateEmergencyRequest,
} from '../request/emergency.dto';
import { DeclareEmergencyCommand } from '../../../application/command/emergency/declare-emergency.command';
import { UpdateEmergencyCommand } from '../../../application/command/emergency/update-emergency.command';
import { ResolveEmergencyCommand } from '../../../application/command/emergency/resolve-emergency.command';
import { ListEmergenciesQuery } from '../../../application/query/emergency/list-emergencies.query';
import { UuidParam } from '../../../../../core/validation/uuid.param';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../core/http/response/forbidden.response';
import { GenericNotFoundResponse } from '../../../../../core/http/response/not-found.response';
import { Role } from '../../../../../core/http/auth/decorator/role.decorator';
import { AuthorizedRequest } from '../../../../../core/http/request/authorized.request';

@ApiTags('flight emergency')
@Controller('api/v1/flight/:flightId/emergency')
export class EmergencyController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Declare a flight emergency',
    description:
      'Records a new emergency declaration on the flight. A flight may carry one active emergency at a time — resolve the active one before declaring another. Resolved declarations remain in the flight history.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'flightId', description: 'Flight unique identifier' })
  @ApiBody({ type: DeclareEmergencyRequest })
  @ApiCreatedResponse({ type: GetEmergencyResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @ApiConflictResponse({
    description: 'An unresolved emergency already exists on this flight.',
  })
  @ApiUnprocessableEntityResponse({
    description:
      'Flight is not between off-block and on-block reports, so no emergency can be declared on it.',
  })
  @Post()
  @Role(UserRole.CabinCrew)
  public async declare(
    @UuidParam('flightId') flightId: string,
    @Req() request: AuthorizedRequest,
    @Body() body: DeclareEmergencyRequest,
  ): Promise<GetEmergencyResponse> {
    return this.commandBus.execute(
      new DeclareEmergencyCommand(flightId, request.user, body),
    );
  }

  @ApiOperation({
    summary: 'Update an active emergency declaration',
    description:
      'Modifies fields of an emergency declaration as the situation evolves. Only the unresolved declaration is mutable — once resolved, the record is immutable history.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'flightId', description: 'Flight unique identifier' })
  @ApiParam({
    name: 'emergencyId',
    description: 'Emergency declaration unique identifier',
  })
  @ApiBody({ type: UpdateEmergencyRequest })
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @ApiUnprocessableEntityResponse({
    description:
      'The emergency has already been resolved and cannot be edited.',
  })
  @Patch(':emergencyId')
  @Role(UserRole.CabinCrew)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async update(
    @UuidParam('flightId') flightId: string,
    @UuidParam('emergencyId') emergencyId: string,
    @Body() body: UpdateEmergencyRequest,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateEmergencyCommand(flightId, emergencyId, body),
    );
  }

  @ApiOperation({
    summary: 'Resolve an emergency declaration',
    description:
      'Marks the emergency as resolved. The record stays in the flight history with `resolvedAt` and `resolvedBy` populated, but the flight no longer counts as having an active emergency and another declaration may be filed.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'flightId', description: 'Flight unique identifier' })
  @ApiParam({
    name: 'emergencyId',
    description: 'Emergency declaration unique identifier',
  })
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @ApiUnprocessableEntityResponse({
    description: 'The emergency has already been resolved.',
  })
  @Delete(':emergencyId')
  @Role(UserRole.CabinCrew)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async resolve(
    @UuidParam('flightId') flightId: string,
    @UuidParam('emergencyId') emergencyId: string,
    @Req() request: AuthorizedRequest,
  ): Promise<void> {
    await this.commandBus.execute(
      new ResolveEmergencyCommand(flightId, emergencyId, request.user),
    );
  }

  @ApiOperation({
    summary: 'List flight emergency declarations',
    description:
      'Returns every emergency declaration ever filed against the flight (active and resolved), newest first. Returns an empty array when none has been declared.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'flightId', description: 'Flight unique identifier' })
  @ApiOkResponse({ type: GetEmergencyResponse, isArray: true })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @Get()
  @Role(UserRole.CabinCrew, UserRole.Operations)
  public async list(
    @UuidParam('flightId') flightId: string,
  ): Promise<GetEmergencyResponse[]> {
    return this.queryBus.execute(new ListEmergenciesQuery(flightId));
  }
}
