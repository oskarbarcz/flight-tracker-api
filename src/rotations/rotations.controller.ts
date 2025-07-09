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
import { RotationsService } from './rotations.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { GenericBadRequestResponse } from '../common/response/bad-request.response';
import { GenericNotFoundResponse } from '../common/response/not-found.response';
import { UuidParam } from '../common/validation/uuid.param';
import { UnauthorizedResponse } from '../common/response/unauthorized.response';
import { ForbiddenResponse } from '../common/response/forbidden.response';
import { Role } from '../auth/decorator/role.decorator';
import { UserRole } from '@prisma/client';
import {
  CreateRotationRequest,
  CreateRotationResponse,
  UpdateRotationRequest,
} from './dto/rotation.dto';
import { RotationId } from './entities/rotation.entity';

@ApiTags('rotation')
@Controller('api/v1/rotation')
export class RotationsController {
  constructor(private readonly rotationsService: RotationsService) {}

  @ApiOperation({
    summary: 'Create a rotation',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth()
  @ApiBody({ type: CreateRotationRequest })
  @ApiOkResponse({
    description: 'Rotation was created',
    type: CreateRotationResponse,
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
    description: 'Validation failed',
    type: GenericNotFoundResponse,
  })
  @Post()
  @Role(UserRole.Operations)
  async create(
    @Body() body: CreateRotationRequest,
  ): Promise<CreateRotationResponse> {
    return this.rotationsService.create(body);
  }

  @ApiOperation({
    summary: 'Assign a flight to a rotation',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Rotation unique identifier' })
  @ApiParam({ name: 'flightId', description: 'Flight unique identifier' })
  @ApiNoContentResponse({
    description: 'Flight was assigned to rotation successfully',
  })
  @ApiBadRequestResponse({
    description: 'Validation failed or domain logic error occurred',
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
    description: 'Flight or rotation does not exist',
    type: GenericNotFoundResponse,
  })
  @Post(':id/flight/:flightId')
  @Role(UserRole.Operations)
  @HttpCode(HttpStatus.NO_CONTENT)
  async addFlightToRotation(
    @UuidParam('id') id: string,
    @UuidParam('flightId') flightId: string,
  ): Promise<void> {
    await this.rotationsService.addFlight(id, flightId);
  }

  @ApiOperation({
    summary: 'Remove a flight from a rotation',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Rotation unique identifier' })
  @ApiParam({ name: 'flightId', description: 'Flight unique identifier' })
  @ApiNoContentResponse({
    description: 'Flight was removed from rotation successfully',
  })
  @ApiBadRequestResponse({
    description: 'Validation failed or domain logic error occurred',
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
    description: 'Flight or rotation does not exist',
    type: GenericNotFoundResponse,
  })
  @Delete(':id/flight/:flightId')
  @Role(UserRole.Operations)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeFlightFromRotation(
    @UuidParam('id') id: string,
    @UuidParam('flightId') flightId: string,
  ): Promise<void> {
    await this.rotationsService.removeFlight(id, flightId);
  }

  @ApiOperation({
    summary: 'Retrieve all rotations',
  })
  @ApiBearerAuth()
  @ApiOkResponse({ type: CreateRotationResponse, isArray: true })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @ApiForbiddenResponse({
    description: 'User is not allowed to perform this action',
    type: ForbiddenResponse,
  })
  @Get()
  getAll(): Promise<CreateRotationResponse[]> {
    return this.rotationsService.getAll();
  }

  @ApiOperation({
    summary: 'Retrieve one rotation',
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id' })
  @ApiOkResponse({
    description: 'Rotation was found',
    type: CreateRotationResponse,
  })
  @ApiBadRequestResponse({
    description: 'Rotation id is not valid uuid v4',
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
    description: 'Rotation with given id does not exist',
    type: GenericNotFoundResponse,
  })
  @Get(':id')
  getOneById(@UuidParam('id') id: RotationId): Promise<CreateRotationResponse> {
    return this.rotationsService.getOneById(id);
  }

  @ApiOperation({
    summary: 'Update a rotation',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateRotationRequest })
  @ApiOkResponse({
    description: 'Rotation was updated',
    type: CreateRotationResponse,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed or rotation id is not valid uuid v4',
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
    description: 'Rotation with given id does not exist',
    type: GenericNotFoundResponse,
  })
  @Patch(':id')
  @Role(UserRole.Operations)
  update(
    @UuidParam('id') id: RotationId,
    @Body() body: UpdateRotationRequest,
  ): Promise<CreateRotationResponse> {
    return this.rotationsService.update(id, body);
  }

  @ApiOperation({
    summary: 'Remove a rotation',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id' })
  @ApiNoContentResponse({
    description: 'Rotation was removed successfully',
  })
  @ApiBadRequestResponse({
    description: 'Rotation id is not valid uuid v4',
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
    description: 'Rotation with given id does not exist',
    type: GenericNotFoundResponse,
  })
  @Delete(':id')
  @Role(UserRole.Operations)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@UuidParam('id') id: RotationId): Promise<void> {
    await this.rotationsService.remove(id);
  }
}
