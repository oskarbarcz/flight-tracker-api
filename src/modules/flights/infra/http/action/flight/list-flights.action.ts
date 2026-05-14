import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { FlightListFilters, GetFlightResponse } from '../../request/flight.dto';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { SkipAuth } from '../../../../../../core/http/auth/decorator/skip-auth.decorator';
import { AuthorizedRequest } from '../../../../../../core/http/request/authorized.request';
import { FlightPhase } from '../../../../model/flight.model';
import { ListAllFlightsQuery } from '../../../../application/query/list-all-flights.query';

@ApiTags('flight')
@Controller('api/v1/flight')
export class ListFlightsAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'Retrieve all flights' })
  @ApiQuery({
    name: 'phase',
    description: 'Filter by flight phase',
    type: 'string',
    enum: FlightPhase,
    required: false,
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number',
    type: 'number',
    minimum: 1,
    default: 1,
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Maximum number of items to return',
    type: 'number',
    minimum: 1,
    maximum: 100,
    default: 10,
    required: false,
  })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({
    type: GetFlightResponse,
    isArray: true,
    headers: {
      'X-Total-Count': {
        description: 'Total number of flights',
        schema: { type: 'number' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @Get()
  @SkipAuth()
  async run(
    @Req() request: AuthorizedRequest,
    @Query() filters: FlightListFilters,
    @Res() response: Response,
  ): Promise<void> {
    const onlyPublic = !request.user;
    const query = new ListAllFlightsQuery(onlyPublic, filters);
    const { flights, totalCount } = await this.queryBus.execute(query);

    response.setHeader('X-Total-Count', totalCount.toString());
    response.json(flights);
  }
}
