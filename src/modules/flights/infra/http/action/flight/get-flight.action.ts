import { Controller, Get, NotFoundException, Req } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { GetFlightResponse } from '../../request/flight.dto';
import { GenericBadRequestResponse } from '../../../../../../core/http/response/bad-request.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { SkipAuth } from '../../../../../../core/http/auth/decorator/skip-auth.decorator';
import { AuthorizedRequest } from '../../../../../../core/http/request/authorized.request';
import { FlightTracking } from '../../../../model/flight.model';
import { FlightDoesNotExistError } from '../../request/errors.dto';
import { GetFlightQuery } from '../../../../application/query/get-flight.query';
import { GetFlightTrackingQuery } from '../../../../application/query/get-flight-tracking.query';

@Controller('api/v1/flight')
export class GetFlightAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'Retrieve one flight' })
  @ApiParam({
    name: 'id',
    description: 'Flight unique identifier',
  })
  @ApiOkResponse({
    description: 'Flight was found',
    type: GetFlightResponse,
  })
  @ApiBadRequestResponse({
    description: 'Flight id is not valid uuid v4',
    type: GenericBadRequestResponse,
  })
  @ApiNotFoundResponse({
    description: 'Flight with given it does not exist',
    type: GenericNotFoundResponse,
  })
  @Get(':id')
  @SkipAuth()
  async run(
    @Req() request: AuthorizedRequest,
    @UuidParam('id') id: string,
  ): Promise<GetFlightResponse> {
    const trackingQuery = new GetFlightTrackingQuery(id);
    const tracking = await this.queryBus.execute(trackingQuery);

    if (!tracking) {
      throw new NotFoundException(FlightDoesNotExistError);
    }

    if (!request.user && tracking === FlightTracking.Private) {
      throw new NotFoundException(FlightDoesNotExistError);
    }

    const query = new GetFlightQuery(id);
    return this.queryBus.execute(query);
  }
}
