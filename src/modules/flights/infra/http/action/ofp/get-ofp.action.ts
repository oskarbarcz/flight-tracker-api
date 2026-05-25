import { Controller, Get, Req } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import {
  FlightOfpDetails,
  FlightTracking,
} from '../../../../model/flight.model';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { SkipAuth } from '../../../../../../core/http/auth/decorator/skip-auth.decorator';
import { AuthorizedRequest } from '../../../../../../core/http/request/authorized.request';
import { FlightDoesNotExistError } from '../../../../model/error/flight.error';
import { GetOfpQuery } from '../../../../application/query/get-ofp.query';
import { GetFlightTrackingQuery } from '../../../../application/query/get-flight-tracking.query';

@ApiTags('flight')
@Controller('api/v1/flight')
export class GetOfpAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'Retrieve operational flight plan for flight' })
  @ApiParam({
    name: 'id',
    description: 'Flight unique identifier',
  })
  @ApiOkResponse({ type: FlightOfpDetails })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Get('/:id/ofp')
  @SkipAuth()
  async run(
    @Req() request: AuthorizedRequest,
    @UuidParam('id') id: string,
  ): Promise<FlightOfpDetails> {
    const trackingQuery = new GetFlightTrackingQuery(id);
    const tracking = await this.queryBus.execute(trackingQuery);

    if (!tracking) {
      throw new FlightDoesNotExistError();
    }

    if (!request.user && tracking === FlightTracking.Disabled) {
      throw new FlightDoesNotExistError();
    }

    const query = new GetOfpQuery(id);
    return this.queryBus.execute(query);
  }
}
