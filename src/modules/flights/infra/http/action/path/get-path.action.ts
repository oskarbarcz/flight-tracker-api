import { Controller, Get, NotFoundException, Req } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { SkipAuth } from '../../../../../../core/http/auth/decorator/skip-auth.decorator';
import { AuthorizedRequest } from '../../../../../../core/http/request/authorized.request';
import {
  FlightPathElement,
  FlightTracking,
} from '../../../../model/flight.model';
import { FlightDoesNotExistError } from '../../request/errors.dto';
import { GetPathQuery } from '../../../../application/query/path/get-path.query';
import { GetFlightTrackingQuery } from '../../../../application/query/get-flight-tracking.query';

@ApiTags('flight path')
@Controller('api/v1/flight')
export class GetPathAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'Retrieve flight path' })
  @ApiParam({
    name: 'id',
    description: 'Flight unique identifier',
  })
  @ApiOkResponse({ type: FlightPathElement, isArray: true })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @Get('/:id/path')
  @SkipAuth()
  async run(
    @Req() request: AuthorizedRequest,
    @UuidParam('id') id: string,
  ): Promise<FlightPathElement[]> {
    const trackingQuery = new GetFlightTrackingQuery(id);
    const tracking = await this.queryBus.execute(trackingQuery);

    if (!tracking) {
      throw new NotFoundException(FlightDoesNotExistError);
    }

    if (!request.user && tracking !== FlightTracking.Public) {
      throw new NotFoundException(FlightDoesNotExistError);
    }

    const query = new GetPathQuery(id);
    return this.queryBus.execute(query);
  }
}
