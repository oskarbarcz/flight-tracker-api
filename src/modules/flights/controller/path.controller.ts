import { Controller, Get } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UuidParam } from '../../../core/validation/uuid.param';
import { UnauthorizedResponse } from '../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../core/http/response/forbidden.response';
import { FlightPathElement } from '../entity/flight.entity';
import { FlightsRepository } from '../repository/flights.repository';
import { SkipAuth } from '../../../core/http/auth/decorator/skip-auth.decorator';

@ApiTags('flight-path')
@Controller('api/v1/flight')
export class PathController {
  constructor(private readonly flightRepository: FlightsRepository) {}

  @ApiOperation({ summary: 'Retrieve flight path' })
  @ApiParam({
    name: 'id',
    description: 'Flight unique identifier',
  })
  @ApiOkResponse({ type: FlightPathElement, isArray: true })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @Get('/:id/path')
  @SkipAuth()
  async getFlightPath(
    @UuidParam('id') id: string,
  ): Promise<FlightPathElement[]> {
    return this.flightRepository.getFlightPath(id);
  }
}
