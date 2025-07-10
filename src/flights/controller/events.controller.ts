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
import { UnauthorizedResponse } from '../../common/response/unauthorized.response';
import { EventsRepository } from '../repository/events.repository';
import { ForbiddenResponse } from '../../common/response/forbidden.response';
import { UserRole } from '@prisma/client';
import { Role } from '../../auth/decorator/role.decorator';
import { FlightEventResponse } from '../dto/event.dto';
import { FlightEventScope, FlightEventType } from '../entities/event.entity';

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
  @ApiOkResponse({ type: FlightEventResponse, isArray: true })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @Get('/:id/events')
  @Role(UserRole.CabinCrew, UserRole.Operations)
  async findEventsForFlight(
    @UuidParam('id') id: string,
  ): Promise<FlightEventResponse[]> {
    const events = await this.flightEventsRepository.findForFlight(id);
    return events.map((event) => ({
      ...event,
      scope: event.scope as FlightEventScope,
      type: event.type as FlightEventType,
      payload: event.payload as object,
    }));
  }
}
