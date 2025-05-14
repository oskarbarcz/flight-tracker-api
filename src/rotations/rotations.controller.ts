import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
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
import { ForbiddenRequest } from '../common/response/forbidden.response';
import { Role } from '../auth/decorator/role.decorator';
import { UserRole } from '@prisma/client';
import { AuthorizedRequest } from '../common/request/authorized.request';
import {
  CreateRotationDto,
  CreateRotationResponse,
} from './dto/create-rotation.dto';
import { UpdateRotationDto } from './dto/update-rotation.dto';
import { Rotation } from './entities/rotation.entity';
import { AddFlightToRotationDto } from './dto/add-flight-to-rotation.dto';

@ApiTags('rotation')
@Controller('api/v1/rotation')
export class RotationsController {
  constructor(private readonly rotationsService: RotationsService) {}

  @ApiOperation({
    summary: 'Create a rotation',
    description:
      '**NOTE:** This endpoint is only available for users with `cabin crew` role.',
  })
  @ApiBearerAuth()
  @ApiBody({ type: CreateRotationDto })
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
    type: ForbiddenRequest,
  })
  @Post()
  @Role(UserRole.CabinCrew)
  async create(
    @Body() createRotationDto: CreateRotationDto,
    @Req() request: AuthorizedRequest,
  ) {
    return this.rotationsService.create(request.user.sub, createRotationDto);
  }

  @ApiOperation({
    summary: 'Retrieve all rotations for the current user',
    description:
      '**NOTE:** This endpoint is only available for users with `cabin crew` role.',
  })
  @ApiBearerAuth()
  @ApiOkResponse({ type: Rotation, isArray: true })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @ApiForbiddenResponse({
    description: 'User is not allowed to perform this action',
    type: ForbiddenRequest,
  })
  @Get()
  @Role(UserRole.CabinCrew)
  findAll(@Req() request: AuthorizedRequest) {
    return this.rotationsService.findAllByUserId(request.user.sub);
  }

  @ApiOperation({
    summary: 'Retrieve one rotation',
    description:
      '**NOTE:** This endpoint is only available for users with `cabin crew` role.',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'Rotation unique identifier',
  })
  @ApiOkResponse({
    description: 'Rotation was found',
    type: Rotation,
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
    type: ForbiddenRequest,
  })
  @ApiNotFoundResponse({
    description: 'Rotation with given id does not exist',
    type: GenericNotFoundResponse,
  })
  @Get(':id')
  @Role(UserRole.CabinCrew)
  findOne(@UuidParam('id') id: string) {
    return this.rotationsService.findOne(id);
  }

  @ApiOperation({
    summary: 'Update a rotation',
    description:
      '**NOTE:** This endpoint is only available for users with `cabin crew` role.',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'Rotation unique identifier',
  })
  @ApiBody({ type: UpdateRotationDto })
  @ApiOkResponse({
    description: 'Rotation was updated',
    type: Rotation,
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
    type: ForbiddenRequest,
  })
  @ApiNotFoundResponse({
    description: 'Rotation with given id does not exist',
    type: GenericNotFoundResponse,
  })
  @Patch(':id')
  @Role(UserRole.CabinCrew)
  update(
    @UuidParam('id') id: string,
    @Body() updateRotationDto: UpdateRotationDto,
    @Req() request: AuthorizedRequest,
  ) {
    return this.rotationsService.update(id, request.user.sub, updateRotationDto);
  }

  @ApiOperation({
    summary: 'Remove a rotation',
    description:
      '**NOTE:** This endpoint is only available for users with `cabin crew` role.',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'Rotation unique identifier',
  })
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
    type: ForbiddenRequest,
  })
  @ApiNotFoundResponse({
    description: 'Rotation with given id does not exist',
    type: GenericNotFoundResponse,
  })
  @Delete(':id')
  @Role(UserRole.CabinCrew)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@UuidParam('id') id: string, @Req() request: AuthorizedRequest) {
    await this.rotationsService.remove(id, request.user.sub);
  }

  @ApiOperation({
    summary: 'Add a flight to a rotation',
    description:
      '**NOTE:** This endpoint is only available for users with `cabin crew` role.',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'Rotation unique identifier',
  })
  @ApiBody({ type: AddFlightToRotationDto })
  @ApiOkResponse({
    description: 'Flight was added to rotation',
    type: Rotation,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed or rotation id is not valid uuid v4',
    type: GenericBadRequestResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @ApAddiForbiddenResponse({
    description: 'User is not allowed to perform this action',
    type: ForbiddenRequest,
  })
  @ApiNotFoundResponse({
    description: 'Rotation or flight with given id does not exist',
    type: GenericNotFoundResponse,
  })
  @Post(':id/flight')
  @Role(UserRole.CabinCrew)
  addFlight(
    @UuidParam('id') id: string,
    @Body() addFlightDto: AddFlightToRotationDto,
    @Req() request: AuthorizedRequest,
  ) {
    return this.rotationsService.addFlight(id, request.user.sub, addFlightDto.flightId);
  }

  @ApiOperation({
    summary: 'Remove a flight from a rotation',
    description:
      '**NOTE:** This endpoint is only available for users with `cabin crew` role.',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'Rotation unique identifier',
  })
  @ApiParam({
    name: 'flightId',
    description: 'Flight unique identifier',
  })
  @ApiOkResponse({
    description: 'Flight was removed from rotation',
    type: Rotation,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed or ids are not valid uuid v4',
    type: GenericBadRequestResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @ApiForbiddenResponse({
    description: 'User is not allowed to perform this action',
    type: ForbiddenRequest,
  })
  @ApiNotFoundResponse({
    description: 'Rotation or flight with given id does not exist',
    type: GenericNotFoundResponse,
  })
  @Delete(':id/flight/:flightId')
  @Role(UserRole.CabinCrew)
  removeFlight(
    @UuidParam('id') id: string,
    @UuidParam('flightId') flightId: string,
    @Req() request: AuthorizedRequest,
  ) {
    return this.rotationsService.removeFlight(id, request.user.sub, flightId);
  }

  @ApiOperation({
    summary: 'Set a rotation as current',
    description:
      '**NOTE:** This endpoint is only available for users with `cabin crew` role.',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'Rotation unique identifier',
  })
  @ApiOkResponse({
    description: 'Rotation was set as current',
    type: Rotation,
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
    type: ForbiddenRequest,
  })
  @ApiNotFoundResponse({
    description: 'Rotation with given id does not exist',
    type: GenericNotFoundResponse,
  })
  @Post(':id/set-current')
  @Role(UserRole.CabinCrew)
  setCurrentRotation(
    @UuidParam('id') id: string,
    @Req() request: AuthorizedRequest,
  ) {
    return this.rotationsService.setCurrentRotation(request.user.sub, id);
  }

  @ApiOperation({
    summary: 'Clear current rotation',
    description:
      '**NOTE:** This endpoint is only available for users with `cabin crew` role.',
  })
  @ApiBearerAuth()
  @ApiNoContentResponse({
    description: 'Current rotation was cleared successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @ApiForbiddenResponse({
    description: 'User is not allowed to perform this action',
    type: ForbiddenRequest,
  })
  @Post('/clear-current')
  @Role(UserRole.CabinCrew)
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearCurrentRotation(@Req() request: AuthorizedRequest) {
    await this.rotationsService.clearCurrentRotation(request.user.sub);
  }
}