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
import { FlightsService } from '../service/flights.service';
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
import { GenericBadRequestResponse } from '../../../core/http/response/bad-request.response';
import { GenericNotFoundResponse } from '../../../core/http/response/not-found.response';
import { UuidParam } from '../../../core/validation/uuid.param';
import { Flight } from '../entity/flight.entity';
import { CreateFlightRequest } from '../dto/create-flight.dto';
import { UnauthorizedResponse } from '../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../core/http/response/forbidden.response';
import { Role } from '../../../core/http/auth/decorator/role.decorator';
import { UserRole } from '@prisma/client';
import { AuthorizedRequest } from '../../../core/http/request/authorized.request';

@ApiTags('flight')
@Controller('api/v1/flight')
export class ManagementController {
  constructor(private readonly flightsService: FlightsService) {}

  @ApiOperation({ summary: 'Retrieve all flights' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'Flight unique identifier',
  })
  @ApiOkResponse({ type: Flight, isArray: true })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @Get()
  findAll(): Promise<Flight[]> {
    return this.flightsService.findAll();
  }

  @ApiOperation({ summary: 'Retrieve one flight' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'Flight unique identifier',
  })
  @ApiOkResponse({
    description: 'Flight was found',
    type: Flight,
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
  findOne(@UuidParam('id') id: string) {
    return this.flightsService.find(id);
  }

  @ApiOperation({
    summary: 'Create a flight',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth()
  @ApiBody({ type: CreateFlightRequest })
  @ApiOkResponse({
    description: 'Flight was created',
    type: Flight,
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
  ): Promise<Flight> {
    return this.flightsService.create(input, request.user);
  }

  @ApiOperation({
    summary: 'Remove a flight',
    description:
      '**NOTE:** Flight that has been scheduled cannot be removed. <br />' +
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth()
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
    await this.flightsService.remove(id);
  }
}
