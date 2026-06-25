import { Controller, Get } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { AircraftReposition } from '../../../model/reposition.model';
import { ListAircraftRepositionQuery } from '../../../application/query/reposition/list-aircraft-reposition.query';
import { GetAircraftByIdQuery } from '../../../application/query/aircraft/get-aircraft-by-id.query';
import { UuidParam } from '../../../../../core/validation/uuid.param';
import { GenericBadRequestResponse } from '../../../../../core/http/response/bad-request.response';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { GenericNotFoundResponse } from '../../../../../core/http/response/not-found.response';

@ApiTags('operator fleet')
@Controller('/api/v1/operator/:operatorId/aircraft')
export class ListAircraftRepositionAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'List reposition history of an aircraft' })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'operatorId', description: 'Operator unique identifier' })
  @ApiParam({ name: 'aircraftId', description: 'Aircraft unique identifier' })
  @ApiOkResponse({ type: AircraftReposition, isArray: true })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Get(':aircraftId/reposition')
  async run(
    @UuidParam('operatorId') operatorId: string,
    @UuidParam('aircraftId') aircraftId: string,
  ): Promise<AircraftReposition[]> {
    const getAircraftQuery = new GetAircraftByIdQuery(operatorId, aircraftId);
    await this.queryBus.execute(getAircraftQuery);

    const query = new ListAircraftRepositionQuery(aircraftId);
    return this.queryBus.execute(query);
  }
}
