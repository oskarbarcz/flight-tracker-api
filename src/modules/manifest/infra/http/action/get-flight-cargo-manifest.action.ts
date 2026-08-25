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
import { FlightCargoManifest } from '../../../model/cargo-manifest.model';
import { CargoManifestFilters } from '../request/cargo-manifest.request';
import { GetFlightCargoManifestQuery } from '../../../application/query/get-flight-cargo-manifest.query';

@ApiTags('flight')
@Controller('api/v1/flight')
export class GetFlightCargoManifestAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: 'Retrieve the cargo manifest of a flight',
    description:
      'The manifest is generated when the flight is released, and its shipment and tare ' +
      'weights together equal the cargo tonnage of the loadsheet it was generated from. ' +
      'Position designators are a convention of this system, not a published designation. ' +
      'A null hold variant means the airframe type carries no curated hold data, in which ' +
      'case no unit reports a position or a compartment. Cabin crew may read the manifest ' +
      'only for a flight they captain.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'id', description: 'Flight unique identifier' })
  @ApiOkResponse({ type: FlightCargoManifest })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Get('/:id/cargo-manifest')
  @Role(UserRole.Operations, UserRole.CabinCrew)
  async run(
    @UuidParam('id') id: string,
    @Query() filters: CargoManifestFilters,
    @Req() request: AuthorizedRequest,
  ): Promise<FlightCargoManifest> {
    const query = new GetFlightCargoManifestQuery(
      id,
      request.user.sub,
      request.user.role,
      filters.status,
    );

    return this.queryBus.execute(query);
  }
}
