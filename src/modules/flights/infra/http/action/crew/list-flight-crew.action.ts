import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { Crew } from '../../../../../operators/model/crew.model';
import { ListFlightCrewQuery } from '../../../../../operators/application/query/crew/list-flight-crew.query';
import { GetFlightQuery } from '../../../../application/query/get-flight.query';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';

@ApiTags('flight crew')
@Controller('api/v1/flight/:flightId/crew')
export class ListFlightCrewAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'Retrieve crew for a flight' })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'flightId', description: 'Flight unique identifier' })
  @ApiOkResponse({ type: Crew, isArray: true })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Get()
  async run(@UuidParam('flightId') flightId: string): Promise<Crew[]> {
    await this.queryBus.execute(new GetFlightQuery(flightId));
    return this.queryBus.execute(new ListFlightCrewQuery(flightId));
  }
}
