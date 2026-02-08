import { Controller, Get } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UuidParam } from '../../../core/validation/uuid.param';
import { UnauthorizedResponse } from '../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../core/http/response/forbidden.response';
import { FlightOfpDetails } from '../entity/flight.entity';
import { GetOfpByFlightIdQuery } from '../application/query/get-ofp-by-flight-id.query';
import { QueryBus } from '@nestjs/cqrs';
import { GenericNotFoundResponse } from '../../../core/http/response/not-found.response';

@ApiTags('flight')
@Controller('api/v1/flight')
export class OfpController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'Retrieve operational flight plan for flight' })
  @ApiParam({
    name: 'id',
    description: 'Flight unique identifier',
  })
  @ApiOkResponse({ type: FlightOfpDetails })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Get('/:id/ofp')
  async getFlightOfp(@UuidParam('id') id: string): Promise<FlightOfpDetails> {
    const query = new GetOfpByFlightIdQuery(id);
    return this.queryBus.execute(query);
  }
}
