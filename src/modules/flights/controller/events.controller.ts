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
import { UuidParam } from '../../../core/validation/uuid.param';
import { UnauthorizedResponse } from '../../../core/http/response/unauthorized.response';
import { EventsRepository } from '../repository/events.repository';
import { ForbiddenResponse } from '../../../core/http/response/forbidden.response';
import { UserRole } from 'prisma/client/client';
import { Role } from '../../../core/http/auth/decorator/role.decorator';
import { FlightEventResponse } from '../dto/event.dto';
import { FlightEventScope } from '../entity/event.entity';
import { FlightEventType } from '../../../core/events/flight';

@ApiTags('flight events')
@Controller('api/v1/flight')
export class EventsController {
  constructor(private readonly flightEventsRepository: EventsRepository) {}

  @ApiOperation({ summary: 'Retrieve events for a flight' })
  @ApiBearerAuth('jwt')
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
