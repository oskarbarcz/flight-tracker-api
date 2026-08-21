import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';
import { GenericBadRequestResponse } from '../../../../../../core/http/response/bad-request.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { UserRole } from '../../../../../users/model/user-role';
import { PullAirportOsmDataQuery } from '../../../../application/query/osm/pull-airport-osm-data.query';
import {
  GetAirportOsmProposalResponse,
  PullAirportOsmDataFilters,
} from '../../request/osm-upgrade.dto';

@ApiTags('airport data enrichment')
@Controller('api/v1/airport/:airportId/enrich')
export class PullOsmDataAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: 'Read airport infrastructure from OpenStreetMap and compare it',
    description:
      'Reads the boundary, runways, terminals, parking positions and gates OpenStreetMap holds for this ' +
      'airport and reports how each differs from the airport model. **Nothing is written.** Every difference ' +
      'carries a key to quote back to `POST` on this path once it has been reviewed.\n\n' +
      'The pull is retained for an hour so a reviewer can come back to it, and so the push applies the very ' +
      'values that were reviewed. A repeat call reuses it rather than querying Overpass again — pass ' +
      '`refresh=true` to insist on fresh data.\n\n' +
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'airportId', description: 'Airport unique identifier' })
  @ApiOkResponse({ type: GetAirportOsmProposalResponse })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({
    type: GenericNotFoundResponse,
    description:
      'The airport does not exist, or OpenStreetMap holds no aerodrome under its ICAO code',
  })
  @ApiBadGatewayResponse({
    description: 'OpenStreetMap could not be reached',
  })
  @Get()
  @Role(UserRole.Operations)
  async run(
    @UuidParam('airportId') airportId: string,
    @Query() filters: PullAirportOsmDataFilters,
  ): Promise<GetAirportOsmProposalResponse> {
    const query = new PullAirportOsmDataQuery(
      airportId,
      filters.refresh ?? false,
    );
    return this.queryBus.execute(query);
  }
}
