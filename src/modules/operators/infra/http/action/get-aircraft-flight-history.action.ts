import { Controller, Get, Res } from '@nestjs/common';
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
import { Response } from 'express';
import { GenericBadRequestResponse } from '../../../../../core/http/response/bad-request.response';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { GenericNotFoundResponse } from '../../../../../core/http/response/not-found.response';
import { UuidParam } from '../../../../../core/validation/uuid.param';
import { GetAircraftByIdQuery } from '../../../application/query/aircraft/get-aircraft-by-id.query';
import { GetAircraftFlightHistoryQuery } from '../../../../flights/application/query/get-aircraft-flight-history.query';
import { FlightHistoryEntry } from '../../../../flights/infra/http/request/flight-history.dto';

@ApiTags('operator fleet')
@Controller('/api/v1/operator/:operatorId/aircraft')
export class GetAircraftFlightHistoryAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'Retrieve flight history for an aircraft' })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'operatorId',
    description: 'Operator unique identifier',
  })
  @ApiParam({
    name: 'aircraftId',
    description: 'Aircraft unique identifier',
  })
  @ApiOkResponse({ type: FlightHistoryEntry, isArray: true })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Get(':aircraftId/flights')
  async run(
    @UuidParam('operatorId') operatorId: string,
    @UuidParam('aircraftId') aircraftId: string,
    @Res() response: Response,
  ): Promise<void> {
    await this.queryBus.execute(
      new GetAircraftByIdQuery(operatorId, aircraftId),
    );

    const { flights, totalCount } = await this.queryBus.execute(
      new GetAircraftFlightHistoryQuery(aircraftId),
    );

    response.setHeader('X-Total-Count', totalCount.toString());
    response.json(flights);
  }
}
