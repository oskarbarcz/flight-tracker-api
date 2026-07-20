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
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { SkipAuth } from '../../../../../../core/http/auth/decorator/skip-auth.decorator';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { GetRunwayResponse } from '../../request/runway.dto';
import { ListRunwaysByAirportQuery } from '../../../../application/query/runway/list-runways-by-airport.query';

@ApiTags('airport runway')
@Controller('api/v1/airport/:airportId/runway')
export class ListRunwaysAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'Retrieve all runways at given airport' })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'airportId', description: 'Airport unique identifier' })
  @ApiOkResponse({ type: GetRunwayResponse, isArray: true })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @SkipAuth()
  @Get()
  async run(
    @UuidParam('airportId') airportId: string,
  ): Promise<GetRunwayResponse[]> {
    const query = new ListRunwaysByAirportQuery(airportId);
    return this.queryBus.execute(query);
  }
}
