import { Controller, Get, Param } from '@nestjs/common';
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
import { WaypointResponse } from '../../../model/waypoint.model';
import { GetWaypointQuery } from '../../../application/query/get-waypoint.query';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { GenericNotFoundResponse } from '../../../../../core/http/response/not-found.response';

@ApiTags('waypoint')
@Controller('api/v1/waypoint')
export class GetWaypointAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: 'Read a catalogued waypoint by its identifier',
    description:
      'Waypoints are accumulated from the flight plans the system imports rather than loaded from a navigation database. An identifier no imported plan has published is not known. Identifiers are not unique worldwide, so more than one waypoint may share one, distinguished by ICAO region.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'ident', example: 'MALOT' })
  @ApiOkResponse({ type: [WaypointResponse] })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Get(':ident')
  async get(@Param('ident') ident: string): Promise<WaypointResponse[]> {
    const query = new GetWaypointQuery(ident);

    return this.queryBus.execute(query);
  }
}
