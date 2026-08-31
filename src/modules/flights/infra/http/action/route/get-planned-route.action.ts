import { Controller, Get, Req } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { SkipAuth } from '../../../../../../core/http/auth/decorator/skip-auth.decorator';
import { AuthorizedRequest } from '../../../../../../core/http/request/authorized.request';
import { FlightTracking } from '../../../../model/flight.model';
import { FlightDoesNotExistError } from '../../../../model/error/flight.error';
import { PlannedRouteResponse } from '../../request/planned-route.dto';
import { GetFlightTrackingQuery } from '../../../../application/query/get-flight-tracking.query';
import { GetPlannedRouteQuery } from '../../../../application/query/get-planned-route.query';

@ApiTags('flight')
@Controller('api/v1/flight')
export class GetPlannedRouteAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: 'Retrieve the planned route of a flight',
    description:
      'Returns the route the flight was planned to fly, in the order it is flown, from the ' +
      'departure airport to the destination. This is the planned route, not the positions the ' +
      'aircraft reported in flight. <br />' +
      '**NOTE:** A flight not created from an operational flight plan reports an empty route.',
  })
  @ApiParam({
    name: 'id',
    description: 'Flight unique identifier',
  })
  @ApiOkResponse({ type: PlannedRouteResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Get('/:id/route')
  @SkipAuth()
  async run(
    @Req() request: AuthorizedRequest,
    @UuidParam('id') id: string,
  ): Promise<PlannedRouteResponse> {
    const trackingQuery = new GetFlightTrackingQuery(id);
    const tracking = await this.queryBus.execute(trackingQuery);

    if (!tracking) {
      throw new FlightDoesNotExistError();
    }

    if (!request.user && tracking === FlightTracking.Disabled) {
      throw new FlightDoesNotExistError();
    }

    return this.queryBus.execute(new GetPlannedRouteQuery(id));
  }
}
