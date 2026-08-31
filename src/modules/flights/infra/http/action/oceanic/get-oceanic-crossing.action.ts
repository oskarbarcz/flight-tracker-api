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
import { FlightOceanicCrossingResponse } from '../../request/oceanic-crossing.dto';
import { GetFlightTrackingQuery } from '../../../../application/query/get-flight-tracking.query';
import { GetOceanicCrossingQuery } from '../../../../application/query/get-oceanic-crossing.query';

@ApiTags('flight')
@Controller('api/v1/flight')
export class GetOceanicCrossingAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: 'Retrieve the oceanic tracks a flight was planned against',
    description:
      'Returns the track message published with the flight plan, both directions as published, ' +
      'and how the flight relates to it. A flight following a track its plan files individually ' +
      'is reported as being on the track geometry, not as being on the track. <br />' +
      '**NOTE:** A flight whose plan published no tracks reports none and a random routing.',
  })
  @ApiParam({
    name: 'id',
    description: 'Flight unique identifier',
  })
  @ApiOkResponse({ type: FlightOceanicCrossingResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Get('/:id/oceanic-crossing')
  @SkipAuth()
  async run(
    @Req() request: AuthorizedRequest,
    @UuidParam('id') id: string,
  ): Promise<FlightOceanicCrossingResponse> {
    const trackingQuery = new GetFlightTrackingQuery(id);
    const tracking = await this.queryBus.execute(trackingQuery);

    if (!tracking) {
      throw new FlightDoesNotExistError();
    }

    if (!request.user && tracking === FlightTracking.Disabled) {
      throw new FlightDoesNotExistError();
    }

    return this.queryBus.execute(new GetOceanicCrossingQuery(id));
  }
}
