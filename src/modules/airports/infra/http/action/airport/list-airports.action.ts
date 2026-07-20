import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { SkipAuth } from '../../../../../../core/http/auth/decorator/skip-auth.decorator';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import {
  AirportListFilters,
  GetAirportResponse,
} from '../../request/airport.dto';
import { ListAllAirportsQuery } from '../../../../application/query/list-all-airports.query';

@ApiTags('airport')
@Controller('api/v1/airport')
export class ListAirportsAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'Retrieve all airports' })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'continent',
    required: false,
    description: 'Filter by continent',
  })
  @ApiOkResponse({
    type: GetAirportResponse,
    isArray: true,
  })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @SkipAuth()
  @Get()
  async run(
    @Query() filters: AirportListFilters,
  ): Promise<GetAirportResponse[]> {
    const query = new ListAllAirportsQuery(filters);
    return this.queryBus.execute(query);
  }
}
