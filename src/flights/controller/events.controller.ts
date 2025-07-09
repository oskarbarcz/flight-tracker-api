import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UuidParam } from '../../common/validation/uuid.param';
import { Flight } from '../entities/flight.entity';
import { UnauthorizedResponse } from '../../common/response/unauthorized.response';
import { EventsRepository } from '../repository/events.repository';
import { ForbiddenResponse } from '../../common/response/forbidden.response';
import { FlightEvent } from '../entities/event.entity';

@ApiTags('flight-events')
@Controller('api/v1/flight')
export class EventsController {
  constructor(private readonly flightEventsRepository: EventsRepository) {}

  @ApiOperation({ summary: 'Retrieve events for a flight' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'Flight unique identifier',
  })
  @ApiOkResponse({ type: Flight, isArray: true })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @Get('/:id/events')
  findEventsForFlight(@UuidParam('id') id: string): Promise<FlightEvent[]> {
    return this.flightEventsRepository.findForFlight(id);
  }
}
