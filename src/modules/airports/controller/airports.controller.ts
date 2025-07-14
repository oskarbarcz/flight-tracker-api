import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AirportsService } from '../service/airports.service';
import { CreateAirportDto } from '../dto/create-airport.dto';
import { UpdateAirportDto } from '../dto/update-airport.dto';
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
import { UserRole } from '@prisma/client';
import { ForbiddenResponse } from '../../../core/http/response/forbidden.response';
import { UnauthorizedResponse } from '../../../core/http/response/unauthorized.response';

@ApiTags('airport')
@Controller('api/v1/airport')
export class AirportsController {
  constructor(private readonly airportsService: AirportsService) {}

  @ApiOperation({
    summary: 'Create new airport',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth()
  @ApiBody({ type: CreateAirportDto })
  @ApiCreatedResponse({
    description: 'Airport was created successfully',
    type: Airport,
  })
  @ApiBadRequestResponse({
    description: 'Request validation failed',
    type: GenericBadRequestResponse<CreateAirportDto>,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @ApiForbiddenResponse({
    description: 'User is not allowed to perform this action',
    type: ForbiddenResponse,
  })
  @Post()
  @Role(UserRole.Operations)
  async create(@Body() createAirportDto: CreateAirportDto): Promise<Airport> {
    return this.airportsService.create(createAirportDto);
  }

  @ApiOperation({ summary: 'Retrieve all airports' })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Airports list',
    type: Airport,
    isArray: true,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @Get()
  async findAll(): Promise<Airport[]> {
    return this.airportsService.findAll();
  }

  @ApiOperation({ summary: 'Retrieve one airport' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'Airport unique identifier',
  })
  @ApiOkResponse({
    description: 'Airport was created successfully',
    type: Airport,
  })
  @ApiBadRequestResponse({
    description: 'Aircraft id is not valid uuid v4',
    type: GenericBadRequestResponse,
  })
  @ApiNotFoundResponse({
    description: 'Airport with given it does not exist',
    type: GenericNotFoundResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @Get(':id')
  async findOne(@UuidParam('id') id: string): Promise<Airport> {
    return this.airportsService.findOne(id);
  }

  @ApiOperation({
    summary: 'Update airport',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'Airport unique identifier',
  })
  @ApiBody({ type: UpdateAirportDto })
  @ApiOkResponse({
    description: 'Airport was updated successfully',
    type: Airport,
  })
  @ApiBadRequestResponse({
    description: 'Request validation failed',
    type: GenericBadRequestResponse<CreateAirportDto>,
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
    description: 'Airport with given it does not exist',
    type: GenericNotFoundResponse,
  })
  @Patch(':id')
  @Role(UserRole.Operations)
  async update(
    @UuidParam('id') id: string,
    @Body() updateAirportDto: UpdateAirportDto,
  ): Promise<Airport> {
    return this.airportsService.update(id, updateAirportDto);
  }

  @ApiOperation({
    summary: 'Remove airport',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'Airport unique identifier',
  })
  @ApiNoContentResponse({
    description: 'Airport was removed successfully',
  })
  @ApiBadRequestResponse({
    description: 'Airport id is not valid uuid v4',
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
    description: 'Airport with given it does not exist',
    type: GenericNotFoundResponse,
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Role(UserRole.Operations)
  async remove(@UuidParam('id') id: string): Promise<void> {
    return this.airportsService.remove(id);
  }
}
