import { Controller, Get, Query, Req } from '@nestjs/common';
import {
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
import { GenericBadRequestResponse } from '../../../../../core/http/response/bad-request.response';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../core/http/response/forbidden.response';
import { GenericNotFoundResponse } from '../../../../../core/http/response/not-found.response';
import { Role } from '../../../../../core/http/auth/decorator/role.decorator';
import { AuthorizedRequest } from '../../../../../core/http/request/authorized.request';
import { UuidParam } from '../../../../../core/validation/uuid.param';
import { UserRole } from '../../../../users/model/user-role';
import { FlightManifest } from '../../../model/manifest.model';
import { ManifestFilters } from '../request/manifest.request';
import { GetFlightManifestQuery } from '../../../application/query/get-flight-manifest.query';

@ApiTags('flight')
@Controller('api/v1/flight')
export class GetFlightManifestAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: 'Retrieve the seated passenger manifest of a flight',
    description:
      'The manifest is generated when the flight is released and seated against the layout ' +
      'revision pinned at that moment. Cabin crew may read it only for a flight they captain.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'id', description: 'Flight unique identifier' })
  @ApiOkResponse({ type: FlightManifest })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Get('/:id/manifest')
  @Role(UserRole.Operations, UserRole.CabinCrew)
  async run(
    @UuidParam('id') id: string,
    @Query() filters: ManifestFilters,
    @Req() request: AuthorizedRequest,
  ): Promise<FlightManifest> {
    const query = new GetFlightManifestQuery(
      id,
      request.user.sub,
      request.user.role,
      filters.status,
    );

    return this.queryBus.execute(query);
  }
}
