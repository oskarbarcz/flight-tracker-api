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
import { EtopsBriefingResponse } from '../../request/etops-briefing.dto';
import { GetFlightTrackingQuery } from '../../../../application/query/get-flight-tracking.query';
import { GetEtopsBriefingQuery } from '../../../../application/query/get-etops-briefing.query';

@ApiTags('flight')
@Controller('api/v1/flight')
export class GetEtopsBriefingAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: 'Retrieve the ETOPS briefing of a flight',
    description:
      'Returns the ETOPS plan with its points and airports, the planned route and the oceanic ' +
      'crossing, in one document drawable as it stands. <br />' +
      '**NOTE:** A flight imported from a plan that does not fly ETOPS reports its route and ' +
      'crossing and no ETOPS section. <br />' +
      '**NOTE:** A flight with no imported flight plan is reported as not found.',
  })
  @ApiParam({
    name: 'id',
    description: 'Flight unique identifier',
  })
  @ApiOkResponse({ type: EtopsBriefingResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Get('/:id/etops-briefing')
  @SkipAuth()
  async run(
    @Req() request: AuthorizedRequest,
    @UuidParam('id') id: string,
  ): Promise<EtopsBriefingResponse> {
    const trackingQuery = new GetFlightTrackingQuery(id);
    const tracking = await this.queryBus.execute(trackingQuery);

    if (!tracking) {
      throw new FlightDoesNotExistError();
    }

    if (!request.user && tracking === FlightTracking.Disabled) {
      throw new FlightDoesNotExistError();
    }

    return this.queryBus.execute(new GetEtopsBriefingQuery(id));
  }
}
