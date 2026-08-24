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
import { FlightNotoc } from '../../../model/notoc.model';
import { NotocFilters } from '../request/notoc.request';
import { GetFlightNotocQuery } from '../../../application/query/get-flight-notoc.query';

@ApiTags('flight')
@Controller('api/v1/flight')
export class GetFlightNotocAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: 'Retrieve the notification to captain of a flight',
    description:
      'The preliminary notification is issued when the flight is released and the final one ' +
      'when boarding finishes, each an immutable record of the load at that moment. The ' +
      'preliminary one is acknowledged by the pilot checking in and the final one by the ' +
      'request that finishes boarding, so there is no separate acknowledgement action. The ' +
      'final notification also reports what changed since the preliminary one. Emergency ' +
      'response codes and their drills are derived from the published drill chart. Cabin ' +
      'crew may read the notification only for a flight they captain.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'id', description: 'Flight unique identifier' })
  @ApiOkResponse({ type: FlightNotoc })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Get('/:id/notoc')
  @Role(UserRole.Operations, UserRole.CabinCrew)
  async run(
    @UuidParam('id') id: string,
    @Query() filters: NotocFilters,
    @Req() request: AuthorizedRequest,
  ): Promise<FlightNotoc> {
    const query = new GetFlightNotocQuery(
      id,
      request.user.sub,
      request.user.role,
      filters.stage,
    );

    return this.queryBus.execute(query);
  }
}
